import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [...compat.extends('eslint:recommended', 'prettier'), {
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.module,
      ...globals.jest,
    },

    ecmaVersion: 2021,
    sourceType: 'module',
  },

  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'windows'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'eol-last': ['error', 'always'],

    'no-multiple-empty-lines': ['error', {
      max: 2,
      maxEOF: 1,
      maxBOF: 0,
    }],

    'no-unused-vars': ['error', {
      vars: 'all',
      argsIgnorePattern: '^_',
    }],
  },
}]
