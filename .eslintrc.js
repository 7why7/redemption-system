module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 以下是一些常用的自定义规则，您可以根据需要调整
    'space-before-function-paren': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'semi': ['error', 'never']
  }
} 