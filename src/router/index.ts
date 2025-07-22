import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserView from '../views/UserGraphView.vue'
import WorkSpaceView from '../views/WorkSpaceView.vue'
import ConfigView  from '../views/ConfigCardView.vue'
import ModelConfigDetail from '../views/ModelConfigDetail.vue'
import VectorDbView from '../views/VectorDbView.vue'
import VectorDbDetail from '../views/VectorDbDetail.vue'
import ChatView from '../views/ChatView.vue';
import ChatHistoryView from '../views/ChatHistoryView.vue';
import ChatIntroView from '../views/ChatIntroView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import FineTunningView from '../views/FineTunningView.vue';
import FineTuneDetailView from '../views/FineTuneDetailView.vue'
import ChatFinetunedView from '../views/ChatFinetunedView.vue'
import LocalModelView from '../views/LocalModelView.vue'
import PermissionManageView from '../views/PermissionManageView.vue'

import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresPermission?: string  // 明确定义类型
  }
}
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
      path: '/user',
      name: 'user',
      component: UserView,
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
      meta: { requiresAuth: true,
        requiresPermission: 'config'
       }
    },
    {
      path: '/database',
      name: 'database',
      component: VectorDbView,
      meta: { requiresAuth: true,
        requiresPermission: 'database'
       }
    },
    {
      path: '/database/:id',
      name: 'databaseDetail',
      component: VectorDbDetail,
      meta: { requiresAuth: true,
        requiresPermission: 'database'
       }
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true }
    },
    {
      path: '/chatFinetuned',
      name: 'chatFinetuned',
      component: ChatFinetunedView,
      meta: { requiresAuth: true }
    },
    {
      path: '/intro',
      name: 'intro',
      component: ChatIntroView,
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
    },
    {
      path: '/config/:id',
      name: 'configDetail',
      component: ModelConfigDetail,
      meta: { requiresAuth: true,
        requiresPermission: 'config'
       }
    },
    {
      path: '/model',
      name: 'model',
      component: FineTunningView,
      meta: { requiresAuth: true,
        requiresPermission: 'model'
       }
    },
    {
      path: '/fine-tune/create',
      name: 'FineTuneCreate',
      component: () => import('../views/FineTuneCreateView.vue'),
      meta: { requiresAuth: true,
        requiresPermission: 'model'
       }
    },
    {
      path: '/fine-tune/:id',
      name: 'FineTuneDetail',
      component: FineTuneDetailView,
      meta: { requiresAuth: true,
        requiresPermission: 'model'
       }
    },
    {
      path: '/local-model',
      name: 'LocalModel',
      component: LocalModelView,
      meta: { requiresAuth: true,
        requiresPermission: 'local-model' }
      },
    {
      path: "/chatBase",
      name: 'ChatBase',
      component: () => import('../views/ChatBaseView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/permission',
      name: 'Permission',
      component: PermissionManageView,
      meta: { requiresAuth: true,
        requiresPermission: 'permission' }
    },
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
      // 检查权限
      if (to.meta.requiresPermission) {
        const hasPerm = await userStore.hasPermission(to.meta.requiresPermission);
        if (!hasPerm) {
          ElMessage.error('无权限访问！');
          next(from.fullPath); // 返回原页面或跳转到无权限页面
          return;
        }
      }
      next();
    } else {
      // 未认证，重定向到登录页
      next({ 
        name: 'login', 
        query: { 
          redirect: to.fullPath,
          reason: 'unauthenticated'
        } 
      });
    }
  } else if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated) {
    // 已登录用户访问登录/注册页，重定向到首页
    next({ name: 'home' });
  } else {
    // 其他情况正常导航
    next();
  }
})
export default router