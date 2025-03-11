import { PackageManager } from '@antfu/install-pkg'
import { x } from 'tinyexec'

export const hasPackageManager = async (
  packageManager: PackageManager | 'npx'
): Promise<boolean> => {
  try {
    const res = await x(packageManager, ['-v'], {
      nodeOptions: {
        stdio: 'ignore',
      },
    })

    if (res.exitCode !== 0) {
      return false
    }

    return true
  } catch {
    return false
  }
}
