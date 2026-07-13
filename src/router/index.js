import Vue from 'vue'
import VueRouter from 'vue-router'
import Start from '@/views/Start.vue'
import Layout from '@/views/Layout.vue'
import MapView from '@/views/MapView.vue'
import History from '@/views/History.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Start },
  { path: '/login', redirect: '/' },
  {
    path: '/',
    component: Layout,
    children: [
      { path: 'map', component: MapView },
      { path: 'history', component: History }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
