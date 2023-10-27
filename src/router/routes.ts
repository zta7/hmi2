import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/HMI',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/HMI.vue') }]
  },
  {
    path: '/order',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/OrderPage.vue')
    }]
  },
  {
    path: '/recipe',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/RecipePage.vue')
    }]
  },
  // {
  //   path: '/ecc',
  //   component: () => import('layouts/MainLayout.vue'),
  //   children: [{ path: '', component: () => import('pages/EccPage.vue') }]
  // },
  // {
  //   path: '/net',
  //   component: () => import('layouts/MainLayout.vue'),
  //   children: [{ path: '', component: () => import('pages/NetPage.vue') }]
  // },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/LoginPage.vue')
    }]
  },
  {
    path: '/index',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/IndexPage.vue')
    }]
  },
  {
    path: '/screen',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      props: route => ({ query: route.query.name }),
      component: () => import('pages/ScreenPage.vue')
    }]
  },
  {
    path: '/history',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      // props: route => ({ query: route.query.name }),
      component: () => import('pages/HistoryData.vue')
    }]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
