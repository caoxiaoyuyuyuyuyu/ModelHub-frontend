<script setup lang="ts">
import { ref } from 'vue';
import { Setting, DataBoard, Cpu, Collection, Key } from '@element-plus/icons-vue';

// 工作台卡片数据
const workspaces = ref([
  {
    id: 1,
    title: '模型配置管理',
    description: '创建、编辑和管理您的个性化AI模型配置',
    icon: Setting,
    bgColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    route: '/config'
  },
  {
    id: 2,
    title: '数据库管理',
    description: '管理您的向量数据库和知识库文档',
    icon: DataBoard,
    bgColor: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    route: '/database'
  },
  {
    id: 3,
    title: '微调管理',
    description: '管理您的微调模型',
    icon: Cpu,
    bgColor: 'linear-gradient(135deg, #d299c2 0%, #f38181 100%)',
    route: '/model'
  },
  {
    id: 4, // 唯一ID
    title: '模型管理',
    description: '管理您的本地模型',
    icon: Collection, // 不同图标
    bgColor: 'linear-gradient(135deg, rgb(186 146 230) 0%, rgb(37, 117, 252) 100%)', // 不同背景
    route: '/local-model'
  },
  {
    id: 5,
    title: '权限管理',
    description: '管理用户和功能权限',
    icon: Key,
    bgColor: 'linear-gradient(135deg, rgb(236 247 236) 0%, rgb(38 203 31) 100%)', // 修改为深蓝色渐变
    route: '/permission'
  }
]);

</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <h2>工作台</h2>
      <p class="subtitle">管理您的AI模型配置和数据资源</p>
      
      <!-- 工作台网格 -->
      <div class="workspace">
        <RouterLink
        v-for="workspace in workspaces" 
        :key="workspace.id" :to="workspace.route" class="workspace-card">
          <div class="card-icon" :style="{ background: workspace.bgColor }">
            <component :is="workspace.icon" class="icon" :style="{height: 'inherit'}"/>
          </div>
          <div class="card-content">
            <h3>{{ workspace.title }}</h3>
            <p>{{ workspace.description }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workspace {
    display: flex;
    gap: 50px;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
}
.workspace-card {
  display: block;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  text-decoration: none;
  color: inherit;
  margin-bottom: 20px;
  min-width: 500px;
}

.workspace-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.1);
}

.card-icon {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon .icon {
  font-size: 48px;
  color: white;
}

.card-content {
  padding: 20px;
}

.card-content h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.card-content p {
  margin: 0;
  color: #666;
  font-size: 0.9em;
}

:deep(.el-row){
  justify-content: space-evenly;
}

</style>