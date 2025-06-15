<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Plus, Refresh } from '@element-plus/icons-vue';
import VectorDbCard from '@/components/VectorDbCard.vue';
import ModelPagination from '@/components/ModelPagination.vue';
import type { VectorDbBase } from '../types/vectorDb';

// 模拟数据
const vectorDBs = ref<VectorDbBase[]>([
  {
    id: 1,
    name: '客户知识库',
    describe: '包含所有客户信息和交互历史的向量数据库，支持快速检索客户相关数据',
    created_at: '2023-07-01',
    updated_at: '2023-09-15'
  },
  {
    id: 2,
    name: '技术文档库',
    describe: '存储公司所有技术文档和API参考，使用先进的向量索引技术实现毫秒级搜索',
    created_at: '2023-05-12',
    updated_at: '2023-10-20'
  },
  {
    id: 3,
    name: '产品数据库',
    describe: '包含所有产品信息和规格的向量数据库，支持多模态检索和相似产品推荐',
    created_at: '2023-08-03',
    updated_at: '2023-11-05'
  },
  {
    id: 4,
    name: '法律文档库',
    describe: '存储公司所有法律合同和合规文档的专用向量数据库，支持语义搜索和条款提取',
    created_at: '2023-06-18',
    updated_at: '2023-10-28'
  }
]);

const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(40);

// 状态选项
const statusOptions = ref([
  '全部', '运行中', '已停止', '异常'
]);

// 当前选择的筛选条件
const selectedStatus = ref('全部');

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
  // 实际应用中这里应该调用API获取新页面的数据
  loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error('加载数据失败:', error);
  }
};

const handleCreate = () => {
  console.log('创建新的向量数据库');
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <h2>向量数据库管理</h2>
      <p class="subtitle">管理您的向量数据库实例和数据</p>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="action-buttons"> 
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建数据库</el-button>
          <el-button :icon="Refresh" @click="loadData">刷新</el-button>
        </div>
        
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索数据库名称..."
            clearable
            class="search-input"
          >
            <template #append>
              <el-button :icon="Search" />
            </template>
          </el-input>
        </div>
      </div>
      
      <!-- 筛选条件 -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="filter-label">状态</span>
          <el-radio-group v-model="selectedStatus" class="filter-options">
            <el-radio-button 
              v-for="status in statusOptions" 
              :key="status" 
              :label="status" 
              size="large"
              class="filter-button"
            />
          </el-radio-group>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-loading="loading" class="vector-db-list">
        <template v-if="vectorDBs.length > 0">
          <VectorDbCard 
            v-for="db in vectorDBs" 
            :key="db.id"
            v-bind="db"
          />
        </template>
        
        <div v-else class="empty-state">
          <el-empty description="暂无向量数据库" />
        </div>
      </div>
      
      <!-- 分页 -->
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
.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-container {
  display: flex;
}

.search-input {
  width: 300px;
}

.filter-section {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  color: #606266;
  font-size: 0.95rem;
  min-width: 100px;
  padding-top: 8px;
}

.filter-options {
  flex-wrap: wrap;
  flex-grow: 1;
  gap: 0.5rem;
}

.filter-button {
  color: #606266;
  font-size: 0.95rem;
}

.vector-db-list {
  min-height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #fafafa;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .filter-group {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .filter-label {
    min-width: auto;
    padding-top: 0;
  }
}
</style>