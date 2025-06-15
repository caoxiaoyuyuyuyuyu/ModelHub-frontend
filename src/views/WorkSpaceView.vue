<script setup lang="ts">
import { ref } from 'vue';
import { Setting, DataBoard } from '@element-plus/icons-vue';

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
            <component :is="workspace.icon" class="icon" />
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
  min-width: 400px;
}

.workspace-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.1);
}

.card-icon {
  height: 120px;
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