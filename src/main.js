import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// 主题管理
const defaultTheme = localStorage.getItem('theme-mode') || 'light'
document.documentElement.setAttribute('theme-mode', defaultTheme)

// 注入全局主题管理方法
Vue.prototype.$toggleTheme = function() {
  const currentTheme = document.documentElement.getAttribute('theme-mode')
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('theme-mode', newTheme)
  localStorage.setItem('theme-mode', newTheme)
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
