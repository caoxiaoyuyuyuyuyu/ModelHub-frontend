<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Plus, Refresh, Cpu } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import type { FineTunedModel, BaseModel } from '../types/model';
import { fetchFineTunedModels, fetchBaseModels } from '../api/fintuning';

const router = useRouter();
const baseModels = ref<BaseModel[]>([]);
const fineTunedModels = ref<FineTunedModel[]>([]);
const loading = ref(false);
const searchQuery = ref('');

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    fineTunedModels.value = await fetchFineTunedModels();
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error('加载数据失败:', error);
  }
};

// 打开微调页面
const handleStartFineTune = () => {
  router.push('/fine-tune/create');
};

const handleUseModel = (id: number, name: string) => {
  router.push({
    path: '/intro',
    query: {
      config_name: name,
      model_config_id: id,
      model_type: 'finetuned'
    }
  });
};

const handleDetail = (id: number) => {
  router.push({
    name: 'FineTuneDetail',
    params: { id: id }
  });
};

onMounted(async () => {
  baseModels.value = await fetchBaseModels();
  loadData();
});
</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <div class="header-section">
        <h2><el-icon :size="24" style="vertical-align: middle; margin-right: 8px;"><Cpu /></el-icon>微调管理</h2>
        <p class="subtitle">管理您的微调模型</p>
      </div>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="action-buttons"> 
          <ElButton type="primary" :icon="Plus" @click="handleStartFineTune" class="fine-tune-button">
            开始微调
          </ElButton>
          <ElButton :icon="Refresh" @click="loadData">刷新</ElButton>
        </div>
        <!-- <div class="search-container">
          <ElInput
            v-model="searchQuery"
            placeholder="搜索模型名称..."
            clearable
            class="search-input"
          >
            <template #append>
              <ElButton :icon="Search" />
            </template>
          </ElInput>
        </div> -->
      </div>
      
      <!-- 模型卡片网格 -->
      <div class="model-grid" v-loading="loading">
        <div class="model-card" v-for="model in fineTunedModels" :key="model.id">
          <div class="card-header">
            <div class="model-info">
              <h3>{{ model.name }}</h3>
            </div>
            <ElTag size="large">
            {{ model.status === 'completed' ? '已完成' : model.status === 'training' ? '训练中' : '失败' }}
            </ElTag>
          </div>
          
          <div class="description-area">
            <p class="description">{{ model.describe || '暂无描述' }}</p>
          </div>
          
          <!-- 注释掉的元数据部分保持不变 -->
          
          <div class="card-footer">
            <div class="author-date">
              <span class="date">创建于: {{ model.updated_at }}</span>
            </div>
            <div class="actions">
              <ElButton type="primary" size="large" @click="handleUseModel(model.id, model.name)" v-if="model.status === 'completed'">使用</ElButton>
              <ElButton type="info" size="large" disabled v-else>不可用</ElButton>
              <div>
              <ElButton type="primary" size="large" @click="handleDetail(model.id)">查看详情</ElButton>
              <!-- <ElButton type="danger" size="large">删除</ElButton> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
.header-section {
  margin-bottom: 24px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.fine-tune-button {
  background: linear-gradient(135deg, #d299c2 0%, #f38181 100%);
  border: none;
}

.search-container {
  display: flex;
  align-items: center;
}

.search-input {
  width: 300px;
}

.model-grid {
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  display: grid;
  align-items: stretch;
}

.model-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  background: radial-gradient(26% 84% at 4% 4%, rgba(216, 219, 231, 0.3) 0%, rgba(232, 236, 242, 0) 94%), #fff;
}

.model-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #d299c2;
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
.model-status {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
  float: right;
}

.model-status.completed {
  background-color: #e1f3d8;
  color: #67c23a;
}

.model-status.training {
  background-color: #f0f9eb;
  color: #409eff;
}

.model-status.failed {
  background-color: #fde2e2;
  color: #f56c6c;
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

.model-meta {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
}

.meta-label {
  color: #909399;
  font-size: 0.9rem;
}

.meta-value {
  font-weight: 500;
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
}

.model-option {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.model-describe {
  color: #999;
  font-size: 0.8em;
}

.dialog-form {
  font-size: 1.1em;
}

.dialog-form :deep(.el-form-item__label) {
  font-size: 1.1em;
  font-weight: 500;
}

.result-content {
  padding: 20px;
  font-size: 1.1em;
  line-height: 1.6;
}

@media (min-width: 1024px) {
  .model-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (min-width: 1536px) {
  .model-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 2048px) {
  .model-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 2560px) {
  .model-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>