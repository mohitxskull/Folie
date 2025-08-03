import {
  Project,
  Node,
  SyntaxKind,
  TypeLiteralNode,
  TypeNode,
  SourceFile,
  TypeAliasDeclaration,
} from 'ts-morph'
import path from 'node:path'

/**
 * Recursively generates a canonical "fingerprint" string for any TypeNode.
 * This normalizes the type's structure by sorting properties alphabetically
 * at every level, making comparisons reliable regardless of original formatting
 * or property order.
 *
 * @param typeNode The node representing the type (e.g., TypeLiteralNode, ArrayTypeNode).
 * @returns A string representing the canonical structure of the type.
 */
function generateCanonicalFingerprint(typeNode: TypeNode): string {
  if (Node.isTypeLiteral(typeNode)) {
    const properties = typeNode.getProperties()

    // Ignore empty types like `{}`.
    if (properties.length === 0 && typeNode.getMembers().length === 0) {
      return '{}'
    }

    // Sort properties alphabetically by name for consistency.
    const sortedProperties = [...properties].sort((a, b) => a.getName().localeCompare(b.getName()))

    const propertyStrings = sortedProperties.map((p) => {
      const propertyName = p.getName()
      const propertyTypeNode = p.getTypeNode()
      // Recursively fingerprint the type of the property.
      const propertyTypeString = propertyTypeNode
        ? generateCanonicalFingerprint(propertyTypeNode)
        : 'any'
      return `${propertyName}: ${propertyTypeString}`
    })

    return `{ ${propertyStrings.join('; ')} }`
  }

  if (Node.isArrayTypeNode(typeNode)) {
    // Recursively fingerprint the element type of the array.
    const elementType = generateCanonicalFingerprint(typeNode.getElementTypeNode())
    return `${elementType}[]`
  }

  // For other simple types (e.g., string, number, custom types), return their text.
  // This handles unions, intersections, etc., by their textual representation.
  return typeNode.getText().trim()
}

/**
 * Tries to find a descriptive name for a new type based on its usage.
 * For example, if it's used in a property `faculty: { ... }[]`, it suggests "Faculty".
 *
 * @param node The TypeLiteralNode to analyze for a potential name.
 * @returns A suggested name (e.g., "Faculty") or undefined.
 */
function getSuggestedName(node: TypeLiteralNode): string | undefined {
  let parent = node.getParent()

  // If the type is part of an array (e.g., `MyType[]`), ascend to the parent of the array node.
  if (Node.isArrayTypeNode(parent)) {
    parent = parent.getParent()
  }

  // If the parent is a property, use its name as the suggestion.
  if (Node.isPropertySignature(parent) || Node.isPropertyAssignment(parent)) {
    const name = parent.getName()
    // Capitalize the first letter to follow type naming conventions.
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // If the parent is a variable declaration, use its name
  if (Node.isVariableDeclaration(parent)) {
    const name = parent.getName()
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return undefined
}

/**
 * Runs a single pass of the refactoring process on the source file.
 * @param sourceFile The ts-morph SourceFile object to process.
 * @param dryRun If true, logs proposed changes without modifying the file.
 * @returns A boolean indicating whether any changes were made in this pass.
 */
function runRefactoringPass(sourceFile: SourceFile, dryRun: boolean): boolean {
  console.log(
    `Analyzing '${path.basename(sourceFile.getFilePath())}' for duplicate type structures...`
  )

  const structureMap = new Map<string, { nodes: TypeLiteralNode[]; suggestedName?: string }>()

  // --- PASS 1: DISCOVERY ---
  const typeLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.TypeLiteral)

  for (const typeLiteral of typeLiterals) {
    // Avoid messing with index signatures for now
    if (typeLiteral.getMembers().some((m) => Node.isIndexSignatureDeclaration(m))) {
      continue
    }

    const fingerprint = generateCanonicalFingerprint(typeLiteral)
    if (!fingerprint || fingerprint === '{}') continue

    if (!structureMap.has(fingerprint)) {
      structureMap.set(fingerprint, { nodes: [], suggestedName: getSuggestedName(typeLiteral) })
    }
    const entry = structureMap.get(fingerprint)!
    entry.nodes.push(typeLiteral)

    if (!entry.suggestedName) {
      entry.suggestedName = getSuggestedName(typeLiteral)
    }
  }

  // --- PASS 2: MUTATION ---
  let changesMade = false
  const usedTypeNames = new Set<string>(sourceFile.getTypeAliases().map((ta) => ta.getName()))
  let sharedTypeCounter = 1

  for (const [fingerprint, entry] of structureMap.entries()) {
    if (entry.nodes.length > 1) {
      changesMade = true

      // FIXED: Use a valid naming convention: Shared1, Shared2, etc.
      let newTypeName: string

      do {
        newTypeName = `Shared${sharedTypeCounter++}`
      } while (usedTypeNames.has(newTypeName))
      usedTypeNames.add(newTypeName)

      console.log(`[INFO] Found ${entry.nodes.length} duplicates for structure: ${fingerprint}`)
      console.log(`       -> Generating unique type alias: 'type ${newTypeName} = ...'`)

      if (!dryRun) {
        sourceFile.insertTypeAlias(0, {
          name: newTypeName,
          type: fingerprint,
          isExported: false, // Shared types are not exported
        })

        // Replace nodes in reverse order to avoid issues with shifting positions
        const nodesToReplace = entry.nodes
        for (let i = nodesToReplace.length - 1; i >= 0; i--) {
          const nodeToReplace = nodesToReplace[i]
          if (!nodeToReplace.wasForgotten()) {
            nodeToReplace.replaceWithText(newTypeName)
          }
        }
      }
    }
  }

  if (!changesMade) {
    console.log('No duplicate structures found in this pass.')
  }

  return changesMade
}

/**
 * After refactoring, cleans up chains of type aliases (e.g., `type A = B; type B = C;`).
 * It replaces all usages of `A` and `B` with `C` and removes the redundant NON-EXPORTED aliases.
 * @param sourceFile The ts-morph SourceFile object to process.
 * @param dryRun If true, logs proposed changes without modifying the file.
 * @returns A boolean indicating whether any changes were made.
 */
function cleanupAliasChains(sourceFile: SourceFile, dryRun: boolean): boolean {
  console.log('\n--- Running Alias Chain Cleanup ---')
  let changesMade = false
  const typeAliases = sourceFile.getTypeAliases()
  const aliasMap = new Map<string, TypeAliasDeclaration>(
    typeAliases.map((ta) => [ta.getName(), ta])
  )
  const replacements = new Map<string, string>()
  const aliasesToRemove = new Set<string>()

  // First, resolve all chains to their final target
  for (const alias of typeAliases) {
    const aliasName = alias.getName()
    let current = alias
    const visited = new Set<string>([aliasName])

    while (true) {
      const typeNode = current.getTypeNode()
      if (Node.isTypeReference(typeNode)) {
        const referencedName = typeNode.getTypeName().getText()
        const nextAlias = aliasMap.get(referencedName)

        // Break if it's not an alias we know, or if we've detected a cycle
        if (!nextAlias || visited.has(referencedName)) {
          break
        }

        visited.add(referencedName)
        current = nextAlias
      } else {
        break // The chain ends here, it's not a simple reference
      }
    }

    const finalName = current.getName()
    if (aliasName !== finalName) {
      replacements.set(aliasName, finalName)
    }
  }

  if (replacements.size === 0) {
    console.log('No redundant alias chains found.')
    return false
  }

  console.log('Found redundant type aliases to clean up:')
  // MODIFIED: Check if an alias is exported before queueing it for removal.
  replacements.forEach((to, from) => {
    const alias = aliasMap.get(from)
    if (alias && !alias.isExported()) {
      console.log(`       - Will replace all uses of '${from}' with '${to}' and remove it.`)
      aliasesToRemove.add(from)
    } else if (alias) {
      console.log(`       - Will update exported alias '${from}' to point to '${to}'.`)
    }
  })
  changesMade = true

  if (!dryRun) {
    // Replace all identifiers that are part of a type reference
    sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).forEach((identifier) => {
      if (Node.isTypeReference(identifier.getParent())) {
        let currentName = identifier.getText()
        // Follow the full replacement chain
        while (replacements.has(currentName)) {
          currentName = replacements.get(currentName)!
        }
        if (identifier.getText() !== currentName) {
          identifier.replaceWithText(currentName)
        }
      }
    })

    // Remove the now-redundant type aliases that are NOT exported
    aliasesToRemove.forEach((aliasName) => {
      const aliasToRemove = aliasMap.get(aliasName)
      if (aliasToRemove && !aliasToRemove.wasForgotten()) {
        aliasToRemove.remove()
      }
    })
  }

  return changesMade
}

// --- SCRIPT EXECUTION ---
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const filePathArg = args.find((arg) => !arg.startsWith('--'))

  const maxRoundsArg = args.find((arg) => arg.startsWith('--max-rounds='))
  let maxRounds = 10 // Default maximum rounds

  if (maxRoundsArg) {
    const roundsValue = Number.parseInt(maxRoundsArg.split('=')[1], 10)
    if (!Number.isNaN(roundsValue) && roundsValue > 0) {
      maxRounds = roundsValue
    } else {
      console.error('ERROR: Invalid value for --max-rounds. It must be a positive number.')
      process.exit(1)
    }
  }

  if (!filePathArg) {
    console.error('ERROR: Please provide a path to a TypeScript file.')
    console.error('Usage: ts-node your-script-name.ts <path-to-file> [--dry-run] [--max-rounds=N]')
    process.exit(1)
  }

  console.log('--- Starting Automatic Type Refactoring ---')
  if (dryRun) {
    console.log('[MODE] Running in Dry Run mode. No changes will be saved.')
  }
  console.log(`[CONFIG] Max refactoring rounds set to ${maxRounds}.`)
  console.log('NOTE: Make sure you have a backup of your file before running without --dry-run.')

  try {
    const project = new Project()
    const sourceFile = project.addSourceFileAtPath(path.resolve(filePathArg))
    let totalChangesMade = false
    let currentRound = 0

    while (currentRound < maxRounds) {
      currentRound++
      console.log(`\n--- Round ${currentRound} of ${maxRounds} ---`)

      const changesThisRound = runRefactoringPass(sourceFile, dryRun)

      if (changesThisRound) {
        totalChangesMade = true
      } else {
        console.log('No more changes detected in structure consolidation.')
        break // Exit the loop if a pass makes no changes
      }
    }

    if (currentRound >= maxRounds) {
      console.warn(
        '\n[WARN] Reached max refactoring rounds. There might be more duplicates to consolidate. You can increase the limit with --max-rounds=N.'
      )
    }

    // After consolidating structures, clean up any resulting alias chains.
    const cleanupChanges = cleanupAliasChains(sourceFile, dryRun)
    if (cleanupChanges) {
      totalChangesMade = true
    }

    if (totalChangesMade) {
      if (dryRun) {
        console.log(
          '\n[DRY RUN] No files were modified. Run without --dry-run to apply all detected changes.'
        )
      } else {
        console.log('\nFormatting and saving file...')
        sourceFile.formatText({
          indentSize: 2,
          convertTabsToSpaces: true,
        })
        await sourceFile.save()
        console.log(
          `\nRefactoring complete! Consolidated and cleaned up types in '${filePathArg}'.`
        )
      }
    } else {
      console.log('\nNo duplicate structures or redundant aliases found to refactor.')
    }
  } catch (error) {
    console.error('\nAn unexpected error occurred:', error)
    process.exit(1)
  }
}

main()
