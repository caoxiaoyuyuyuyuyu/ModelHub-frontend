import { createApp } from 'vue'
import './style.css'
import '@/styles/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router' // 确保路径正确
import { createPinia } from 'pinia'
import App from './App.vue'


const app = createApp(App)
app.use(router) // 必须先注册路由
app.use(ElementPlus)
app.use(createPinia())

app.mount('#app')