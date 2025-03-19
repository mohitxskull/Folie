#!/usr/bin/env tsx

import * as fs from "fs/promises";
import * as path from "path";

/**
 * Processes a single file, reads its content, and appends it to the specified output file.
 * @param filePath The path to the file to process.
 * @param excludedPathsRegex Array of regular expressions for paths to exclude.
 * @param outputFilePath The path to the output file.
 */
async function processFile(
  filePath: string,
  excludedPathsRegex: RegExp[],
  outputFilePath: string,
): Promise<void> {
  try {
    // Check if the file matches any exclusion regex
    const isExcluded = excludedPathsRegex.some((regex) => regex.test(filePath));
    if (isExcluded) {
      console.log(`Skipping file: ${filePath} (excluded by regex)`);
      return;
    }

    // Read the content of the file
    const fileContent = await fs.readFile(filePath, "utf-8");
    const fileExtension = path.extname(filePath).slice(1);

    // Construct the content to append
    const contentToAdd = `\n[${filePath}]\n\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\`\n-------------------------------`;

    // Append the content to the output file
    await fs.appendFile(outputFilePath, contentToAdd);
    console.log(
      `Successfully processed and appended to output file: ${filePath}`,
    );
  } catch (error: any) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively traverses a directory and processes all files within, excluding paths matching the provided regular expressions.
 * @param dirPath The path to the directory to traverse.
 * @param excludedPathsRegex Array of regular expressions for paths to exclude.
 * @param outputFilePath The path to the output file.
 */
async function processDirectory(
  dirPath: string,
  excludedPathsRegex: RegExp[],
  outputFilePath: string,
): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Check if the entry matches any exclusion regex
      const isExcluded = excludedPathsRegex.some((regex) =>
        regex.test(fullPath),
      );
      if (isExcluded) {
        console.log(`Skipping: ${fullPath} (excluded by regex)`);
        continue;
      }

      if (entry.isDirectory()) {
        await processDirectory(fullPath, excludedPathsRegex, outputFilePath);
      } else if (entry.isFile()) {
        await processFile(fullPath, excludedPathsRegex, outputFilePath);
      } else {
        console.log(`Skipping: ${fullPath} (not a file or directory)`);
      }
    }
  } catch (error: any) {
    console.error(`Error reading directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Main function to start the processing.
 */
async function main(): Promise<void> {
  const startDir = ".";
  const excludedPathsRegex = [
    /node_modules/, // Exclude node_modules directory
    /\.git/, // Exclude .git directory
    /package-lock\.json/, // Exclude package-lock.json
    /dist/, //Exclude the dist folder
    /out/,
    /build/,
    /\.turbo/, // Exclude .turbo directory
    /\.changeset/, // Exclude .changeset directory
    /\.env.*/, // Exclude any files starting with .env
    /tmp/,
    /pnpm-lock\.yaml/,
    /\.next/,
    /docs/,
    /README.md/,
    /LICENSE/,
    /CHANGELOG.md/,
    /archive/,
    /\.editorconfig/, // Exclude .editorconfig file
    /\.gitignore/, // Exclude .gitignore file
    /\.npmrc/, // Exclude .npmrc file
    /\.prettierignore/, // Exclude prettierignore file,
    /source_code.txt/,
    /cspell.json/,
    /eslint.config.js/,
    /tsconfig.json/,
    /content.ts/
  ];

  const outputFileName = "source_code.txt"; // Name of the output file

  console.log(`Starting processing from directory: ${startDir}`);
  console.log(
    `Excluding paths matching: ${excludedPathsRegex.map((r) => r.toString()).join(", ")}`,
  );
  console.log(`Output will be written to: ${outputFileName}`);

  try {
    // Create the output file if it doesn't exist, or clear it if it does
    await fs.writeFile(outputFileName, "");

    await processDirectory(startDir, excludedPathsRegex, outputFileName);
    console.log("Processing complete.");
  } catch (error: any) {
    console.error(`An error occurred: ${error.message}`);
  }
}

main();
