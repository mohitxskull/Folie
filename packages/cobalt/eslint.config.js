import { configPkg } from '@adonisjs/eslint-config'
import importPlugin from 'eslint-plugin-import'

export default configPkg({
  languageOptions: {
    parserOptions: {
      warnOnUnsupportedTypeScriptVersion: false,
    },
  },
  files: ['**/*.ts', '**/*.tsx'],
  plugins: {
    import: importPlugin,
  },
  rules: {
    'import/extensions': ['error', 'always'],
  },
})
