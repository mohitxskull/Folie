#!/usr/bin/env tsx

/**
 * https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/package.json
 */

import fs from "node:fs";

// ============================================

type DependencyType = "prod" | "dev" | "peer";
const DependencyTypes: DependencyType[] = ["prod", "dev", "peer"];

class PackageJSON {
  #path: string;
  #data: Record<string, any> | undefined;

  constructor(path: string) {
    this.#path = path;
  }

  async #fileExists(): Promise<boolean> {
    try {
      await fs.promises.access(this.#path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async load(): Promise<void> {
    try {
      const exist = await this.#fileExists();

      if (!exist) {
        throw new Error(`Package.json not found at ${this.#path}`);
      }

      const data = await fs.promises.readFile(this.#path, "utf-8");
      this.#data = JSON.parse(data);
    } catch (error) {
      console.error(`Error loading package.json from ${this.#path}:`, error);
      throw error;
    }
  }

  get data(): any {
    if (!this.#data) {
      throw new Error("Package.json data not loaded yet. Call load() first.");
    }

    return this.#data;
  }

  get name(): string {
    return this.data.name;
  }

  get version(): string {
    return this.data.version;
  }

  async setVersion(version: string): Promise<void> {
    this.data.version = version;
    await this.save();
  }

  getDependencies(
    type: DependencyType = "prod",
  ): Record<string, string> | null {
    switch (type) {
      case "prod":
        return this.data?.dependencies ?? null;

      case "dev":
        return this.data?.devDependencies ?? null;

      case "peer":
        return this.data?.peerDependencies ?? null;
    }
  }

  setDependencies(deps: Record<string, string>, type: DependencyType = "prod") {
    const exist = this.getDependencies(type);

    if (!exist) {
      return;
    }

    switch (type) {
      case "prod":
        this.data.dependencies = deps;
        break;

      case "dev":
        this.data.devDependencies = deps;
        break;

      case "peer":
        this.data.peerDependencies = deps;
        break;
    }
  }

  getDependency(pkg: string, type: DependencyType = "prod"): string | null {
    const exist = this.getDependencies(type);

    if (!exist) {
      return null;
    }

    return exist[pkg] ?? null;
  }

  async updateDependency(
    pkg: string,
    version: string,
    type: "prod" | "dev" | "peer" = "prod",
  ): Promise<void> {
    const exist = this.getDependency(pkg, type);

    if (!exist || exist === version) {
      return;
    }

    this.setDependencies(
      {
        ...this.getDependencies(type),
        [pkg]: version,
      },
      type,
    );

    await this.save();
  }

  async save(): Promise<void> {
    try {
      await fs.promises.writeFile(
        this.#path,
        JSON.stringify(this.data, null, 2),
      );
    } catch (error) {
      console.error(`Error saving package.json to ${this.#path}:`, error);
      throw error;
    }
  }
}

// ============================================

const CONFIG = {
  PACKAGES: [
    "./packages/blueprint",
    "./packages/blueprint_lib",
    "./packages/castle",
    "./packages/cli",
    "./packages/cobalt",
    "./packages/cobalt_animation",
    "./packages/gate",
    "./packages/lib",
    "./packages/squid",
    "./packages/captcha",
  ],
} as const;

const updateDependencies = async (
  packages: Map<string, PackageJSON>,
  target: PackageJSON,
  constVersion?: string,
) => {
  for (const type of DependencyTypes) {
    const exist = target.getDependencies(type);

    if (exist) {
      for (const [dep, pkg] of packages) {
        await target.updateDependency(
          dep,
          constVersion ?? `^${pkg.version}`,
          type,
        );
      }
    }
  }
};

const main = async (cleanup?: boolean) => {
  const pkgs = new Map<string, PackageJSON>();

  for (const pkg of CONFIG.PACKAGES) {
    const pkgJSON = new PackageJSON(`${pkg}/package.json`);

    await pkgJSON.load();

    pkgs.set(pkgJSON.name, pkgJSON);
  }

  if (cleanup === true) {
    for (const [pkg, pkgJSON] of pkgs) {
      await updateDependencies(pkgs, pkgJSON, "workspace:*");
    }
  } else {
    for (const [pkg, pkgJSON] of pkgs) {
      await updateDependencies(pkgs, pkgJSON);
    }
  }
};

const args = process.argv.slice(2);

main(args.includes("--cleanup"))
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
