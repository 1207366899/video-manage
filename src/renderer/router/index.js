import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '*',
      redirect: '/'
    },
    // {
    //   path: '/',
    //   name: 'landing-page',
    //   component: require('@/components/LandingPage').default
    // },
    {
      path: '/',
      name: 'VideoList',
      component: require('@/views/VideoList').default
    },
    {
      path: '/AddFolder',
      name: 'AddFolder',
      component: require('@/views/AddFolder').default
    }
  ]
})
