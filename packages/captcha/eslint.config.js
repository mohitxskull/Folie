import { configPkg } from '@adonisjs/eslint-config'

export default configPkg({
  languageOptions: {
    parserOptions: {
      warnOnUnsupportedTypeScriptVersion: false,
    },
  },
})
