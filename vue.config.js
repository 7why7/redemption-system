module.exports = {
  devServer: {
    port: 8080,
    open: true
  },
  lintOnSave: false,
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/main.scss";`
      }
    }
  }
} 