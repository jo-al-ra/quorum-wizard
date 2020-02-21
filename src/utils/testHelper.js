import { join } from 'path'
import { cwd, libRootDir } from './fileUtils'
export const TEST_CWD = '/current/working/dir'
export const TEST_LIB_ROOT_DIR = '/npm/global/module/dir'

export function createNetPath(config, ...relativePaths) {
  return join(cwd(), 'network', config.network.name, ...relativePaths)
}

export function createLibPath(...relativePaths) {
  return join(libRootDir(), ...relativePaths)
}
