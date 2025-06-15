<script setup lang="ts">
import { ref } from 'vue';
import ModelCard from '@/components/ModelCard.vue';
import ModelPagination from '@/components/ModelPagination.vue';
import { Search } from '@element-plus/icons-vue';

// 模拟数据
const models = ref([
  {
    id: 1,
    title: '图像分类模型',
    description: '基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务',
    author: 'AI实验室',
    avatar: '/public/image.png',
    date: '2023-04-05',
    is_featured: true
  },
  {
    id: 2,
    title: '图像分类模型',
    description: '基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务',
    author: 'AI实验室',
    avatar: '/public/image.png',
    date: '2023-04-05',
    is_featured: true
  },
  {
    id: 3,
    title: '图像分类模型',
    description: '基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务',
    author: 'AI实验室',
    avatar: '/public/image.png',
    date: '2023-04-05',
    is_featured: true
  },
  {
    id: 4,
    title: '图像分类模型',
    description: '基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务',
    author: 'AI实验室',
    avatar: '/public/image.png',
    date: '2023-04-05',
    is_featured: true
  },
  {
    id: 5,
    title: '图像分类模型',
    description: '基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务',
    author: 'AI实验室',
    avatar: '/public/image.png',
    date: '2023-04-05',
    is_featured: true
  },
  {
    id: 6,
    title: '图像分类模型',
    description: '基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务基于ResNet50的图像分类模型，适用于多种场景识别任务',
    author: 'AI实验室',
    avatar: '/public/image.png',
    date: '2023-04-05',
    is_featured: true
  },
]);


const currentPage = ref(1);
const pageSize = ref(16);
const totalPages = ref(1600);
const searchQuery = ref('');

// 供应商选项
const suppliers = ref([
  '全部', '通义', 'DeepSeek', 'INNES', '元语智能', 'HAL', 'BELLE', 
  'Billa', 'BlackForestlabs', 'Databrics', 'IDEA研究院', 
  'Meta', 'MiniMax', 'Stability AI', '其他'
]);

// 配置商选项
const configurators = ref([
  '全部', '阿里云', '腾讯云', '华为云', 'AWS', 'Azure', 
  'Google Cloud', '百度云', '其他'
]);

// 热度选项
const popularityOptions = ref([
  '全部', '热门', '最新', '下载最多', '收藏最多'
]);

// 当前选择的筛选条件
const selectedSupplier = ref('全部');
const selectedConfigurator = ref('全部');
const selectedPopularity = ref('全部');

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
  // 实际应用中这里应该调用API获取新页面的数据
};
</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <h2>模型广场</h2>
      <p class="subtitle">探索和发现高质量的机器学习模型</p>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <h3>模型筛选</h3>
        <ElInput
          v-model="searchQuery"
          placeholder="搜索模型..."
          clearable
          class="search-input"
        >
          <template #append>
            <ElButton :icon="Search" />
          </template>
        </ElInput>
      </div>
      
      <!-- 筛选条件 -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="filter-label">供应商</span>
          <ElRadioGroup v-model="selectedSupplier" class="filter-options">
            <ElRadioButton 
              v-for="supplier in suppliers" 
              :key="supplier" 
              :label="supplier" 
              size="large"
              class="filter-button"
            />
          </ElRadioGroup>
        </div>
        
        <div class="filter-group">
          <span class="filter-label">配置商</span>
          <ElRadioGroup v-model="selectedConfigurator" class="filter-options">
            <ElRadioButton 
              v-for="config in configurators" 
              :key="config" 
              :label="config" 
              size="large"
              class="filter-button"
            />
          </ElRadioGroup>
        </div>
        
        <div class="filter-group">
          <span class="filter-label">热度</span>
          <ElRadioGroup v-model="selectedPopularity" class="filter-options">
            <ElRadioButton 
              v-for="popularity in popularityOptions" 
              :key="popularity" 
              :label="popularity" 
              size="large"
              class="filter-button"
            />
          </ElRadioGroup>
        </div>
      </div>
      
      <!-- 模型网格 -->
      <div class="model-grid">
        <ModelCard
        v-for="model in models" 
        :key="model.id"  v-bind="model" />
      </div>
      <ModelPagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 300px;
}

.model-tabs {
  margin-bottom: 1rem;
}

.filter-section {
  margin-bottom: 2rem;
  /* background: #f5f7fa; */
  padding: 1rem;
  border-radius: 4px;
}

.filter-group {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  color: #909399;
  font-size: 0.95rem;
  min-width: 80px;
}

.filter-options {
  flex-wrap: wrap;
  flex-grow: 1;
}

.filter-button {
  color: #909399;
  font-size: 0.95rem;
}

.model-grid {
  grid-template-columns: repeat(4, minmax(340px, 1fr));
  gap: 4rem 2rem;
  min-width: 1068px;
  display: grid;
}

/* 调整单选按钮样式 */
:deep(.el-radio-button--small .el-radio-button__inner) {
  padding: 5px 12px;
  margin-right: 5px;
  margin-bottom: 5px;
}

/* 去掉 ElRadioButton 的边框 */
:deep(.el-radio-button:not(.is-active) .el-radio-button__inner) {
  border: none;
  box-shadow: none !important;
}

/* 激活状态的样式调整（可选） */
:deep(.el-radio-button.is-active .el-radio-button__inner) {
  border: none;
  box-shadow: none !important;
  background-color: #ecf5ff; /* 可以设置激活状态的背景色 */
  color: #409eff; /* 可以设置激活状态的文字颜色 */
}

/* 悬停状态的样式调整（可选） */
:deep(.el-radio-button:not(.is-active):hover .el-radio-button__inner) {
  background-color: #f5f7fa; /* 悬停时的背景色 */
}
</style>