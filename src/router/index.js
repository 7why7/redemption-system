import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import RedemptionCode from '../views/RedemptionCode.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/redemption',
    name: 'RedemptionCode',
    component: RedemptionCode
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
