<script setup lang="ts">
import { ElTag, ElButton } from 'element-plus';
import { ModelConfig } from '../types/model_config';
import { useRouter } from 'vue-router';

interface ModelConfigCardProps {
  config: ModelConfig;
  baseModelName?: string;
  showActions?: boolean;
}

const props = withDefaults(defineProps<ModelConfigCardProps>(), {
  showActions: true
});

const router = useRouter();
const emit = defineEmits(['delete']);

const handleViewDetail = () => {
  router.push({
    name: 'configDetail',
    params: { id: props.config.id },
    state: { 
      config: JSON.parse(JSON.stringify(props.config)) 
    } // Pass the config data via state
  });
};

const handleDelete = () => {
  emit('delete', props.config.id);
};
</script>

<template>
  <div class="model-config-card">
    <div class="card-header">
      <div class="model-info">
        <h3>{{ config.name }}</h3>
      </div>
      <ElTag size="large" v-if="baseModelName">{{ baseModelName }}</ElTag>
    </div>
    <div class="description-area">
      <p class="description">{{ config.describe || '暂无描述' }}</p>
    </div>
    <div class="card-footer">
      <div class="author-date">
        <span class="date">更新于: {{ new Date(config.updated_at).toLocaleDateString() }}</span>
      </div>
      <div class="actions" v-if="showActions">
        <ElButton size="small" type="primary" @click="handleViewDetail">查看详情</ElButton>
        <ElButton size="small" type="danger" @click="handleDelete">删除</ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-config-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  /* height: 100%; */
  background: radial-gradient(26% 84% at 4% 4%, rgba(216, 219, 231, 0.3) 0%, rgba(232, 236, 242, 0) 94%), #fff;
}

.model-config-card:hover {
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

.model-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #303133;
  font-weight: 500;
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
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
}

.author-date {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e4e7ed;
}

.date {
  font-size: 0.9rem;
  color: #909399;
}

.actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5rem;
}
</style>