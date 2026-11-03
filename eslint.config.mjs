import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.es2022 }
    }
  },
  {
    rules: {
      'capitalized-comments': ['error', 'always'],
      'spaced-comment': ['error', 'always']
    }
  }
]
