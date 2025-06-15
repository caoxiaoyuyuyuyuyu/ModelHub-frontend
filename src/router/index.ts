import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import WorkSpaceView from '../views/WorkSpaceView.vue'
import ConfigView  from '../views/ConfigView.vue'
import VectorDbView from '../views/VectorDbView.vue'
import VectorDbDetail from '../views/VectorDbDetail.vue'
import ChatView from '../views/ChatView.vue';
import ChatHistoryView from '../views/ChatHistoryView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false } // 需要登录
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true }
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: WorkSpaceView,
      meta: { requiresAuth: true }
    },
    {
      path: '/config',
      name: 'config',
      component: ConfigView,
      meta: { requiresAuth: true }
    },
    {
      path: '/database',
      name: 'database',
      component: VectorDbView,
      meta: { requiresAuth: true }
    },
    {
      path: '/database/:id',
      name: 'databaseDetail',
      component: VectorDbDetail,
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'history',
      component: ChatHistoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 添加导航守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 初始化用户状态
  userStore.init()
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (userStore.isAuthenticated && userStore.getToken()) {
      // 已认证且有有效token
      next()
    } else {
      // 未认证，重定向到登录页
      next({ 
        name: 'login', 
        query: { 
          redirect: to.fullPath,
          reason: 'unauthenticated'
        } 
      })
    }
  } else if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated) {
    // 已登录用户访问登录/注册页，重定向到首页
    next({ name: 'home' })
  } else {
    // 其他情况正常导航
    next()
  }
})

export default router