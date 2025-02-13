import { directoryPaths } from '../src/lib/fs.js'

console.log('Welcome to playground!')

console.log(await directoryPaths('build'))
