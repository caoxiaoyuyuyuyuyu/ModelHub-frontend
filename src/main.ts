import { createApp } from 'vue'
import './style.css'
import '@/styles/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router' // 确保路径正确
import { createPinia } from 'pinia'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


const app = createApp(App)
app.use(router) // 必须先注册路由
app.use(ElementPlus)
app.use(createPinia())
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')