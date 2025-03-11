import { existsSync } from 'node:fs'
import { lstat, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export const directoryPaths = async (
  path: string,
  filter?: (path: string) => boolean
): Promise<string[]> => {
  const results: string[] = []

  const traverse = async (currentDir: string) => {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        await traverse(fullPath)
      } else {
        if (!filter || filter(fullPath)) {
          results.push(fullPath)
        }
      }
    }
  }

  await traverse(path)

  return results
}

export const pathExists = (path: string): boolean => {
  return existsSync(path)
}

export const isDirectory = async (path: string): Promise<boolean> => {
  return lstat(path).then((s) => s.isDirectory())
}

export async function readFileOptional(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    return null
  }
}

export const writeFileToPath = async (
  destination: string,
  data: string
): Promise<{ success: true } | { success: false; reason: string }> => {
  try {
    await mkdir(dirname(destination), { recursive: true })

    await writeFile(destination, data, { encoding: 'utf8' })

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      reason: error.message,
    }
  }
}
