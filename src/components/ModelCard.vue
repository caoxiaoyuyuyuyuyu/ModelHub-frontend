<script setup lang="ts">
import { ElAvatar, ElTag } from 'element-plus';
import { useRouter } from 'vue-router';


interface ModelCardProps { 
  id: number;
  name: string;
  author: string;
  isFeatured: boolean;
  describe: string;
  base_model_name: string;
  update_at: string;
}
const props = defineProps<ModelCardProps>();
const router = useRouter();
const handleExperience = () => {
  router.push({
    path: '/intro',
    query: {
      config_name: props.name,
      model_config_id: props.id
    }
  });
};
</script>

<template>
  <div class="model-card" :class="{ 'featured-card': isFeatured }">
    <div class="card-header">
      <div class="model-info">
        <ElAvatar :size="32" :src="'/public/vite.svg'"></ElAvatar>
        <h3>{{ name }}</h3>
      </div>
      <!-- <ElTag size="large">{{ isFeatured ? '推荐' : '最新' }}</ElTag> -->
      <ElTag size="large">{{ base_model_name }}</ElTag>
    </div>
    <div class="description-area">
      <p class="description">{{ describe }}</p>
    </div>
    <div class="card-footer">
      <div class="author-date">
        <div class="author-info">
          <!-- <ElAvatar :size="24" :src="avatar" /> -->
          <ElTag>{{ author }}</ElTag>
        </div>
        <span class="date">{{ update_at }}</span>
      </div>
      <div class="actions">
        <ElButton size="large" type="text">查看详情</ElButton>
        <ElButton size="large" type="text">API参考</ElButton>
        <ElButton size="large" type="primary" @click="handleExperience()">立即体验</ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s;
  /* height: 100%; */
  display: flex;
  flex-direction: column;
  /* background-color: #fff; */
  justify-content: space-between;
  padding-bottom: 0.5rem;
  background: radial-gradient(26% 84% at 4% 4%, rgba(216, 219, 231, 0.3) 0%, rgba(232, 236, 242, 0) 94%), #fff;
}

.model-card.featured-card {
  border-left: 4px solid #409eff;
}

.model-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #409eff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.model-info { 
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  flex-direction: row;
  gap: 0.5rem;
}

.model-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #303133;
  font-weight: 500;
}

.date {
  font-size: 0.9rem;
  color: #909399;
}

.description-area { 
  margin-bottom: 1.5rem;
  height: 5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  color: #909399;
  font-size: 0.95rem;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  gap: 0.5rem;
}

.author-date { 
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e4e7ed;
}

.author-info {
  display: flex;
  align-items: space-between;
  gap: 0.5rem;
}

.author-info span {
  font-size: 0.9rem;
  color: #909399;
}

.actions {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-around;
}

.actions .el-button {
  padding: 5px 8px;
}

.actions .el-button:not(.el-button--primary) {
  color: #1a1b1c;
}

.actions .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}
</style>