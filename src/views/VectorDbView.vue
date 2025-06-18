<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Plus, Refresh } from '@element-plus/icons-vue';
import VectorDbCard from '@/components/VectorDbCard.vue';
import ModelPagination from '@/components/ModelPagination.vue';
import type { VectorDbBase } from '../types/vectorDb';
import { createVectorDb, fetchOwnVectors } from '../api/vectorDb';
import type { ModelInfo } from '../types/model_config';
import { getEmbeddingModelInfos } from '../api/model';

const baseModels = ref<ModelInfo[]>([]);
// 模拟数据
const vectorDBs = ref<VectorDbBase[]>([]);

const dialogVisible = ref(false);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(40);

const form = ref({
  id: null,
  name: '',
  describe: '',
  embedding_id: null,
  document_similarity: 0.5,
});
const formRules = {
  name: [{ required: true, message: '请输入数据库名称', trigger: 'blur' }],
};
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
    vectorDBs.value = await fetchOwnVectors();
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error('加载数据失败:', error);
  }
};
// 初始化表单
const initForm = () => {
  form.value = {
    id: null,
    name: '',
    describe: '',
    embedding_id: null,
    document_similarity: 0.5,
  };
};
// 提交表单
const submitForm = async () => {
  loading.value = true;
  try {
    console.log('提交表单', form.value);
    // 创建配置
    await createVectorDb(form.value);
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    loading.value = false;
  }
};
// 打开创建对话框
const handleCreate = () => {
  initForm();
  dialogVisible.value = true;
};
onMounted(async () => {
  baseModels.value = await getEmbeddingModelInfos();
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
    <!-- 数据库表单对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="'新建数据库'"
      width="50%"
      style="font-size: larger;"
    >
      <ElForm
        :model="form"
        :rules="formRules"
        label-width="120px"
        ref="formRef"
        class="dialog-form"
      >
        <ElFormItem label="数据库名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入数据库名称" />
        </ElFormItem>
        
        <ElFormItem label="描述" prop="describe"> 
          <ElInput v-model="form.describe" placeholder="请输入描述" />
        </ElFormItem>
        <ElFormItem label="嵌入模型" prop="embedding_id">
          <ElSelect
            v-model="form.embedding_id"
            placeholder="请选择嵌入模型"
            style="width: 100%"
          >
            <ElOption
              v-for="model in baseModels"
              :key="model.id"
              :label="model.model_name"
              :value="model.id"
            >
              <div class="model-option">
                <span>{{ model.model_name }}</span>
                <!-- <span class="model-describe">{{ model.describe }}</span> -->
              </div>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="相似度">
          <ElSlider
            v-model="form.document_similarity"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </ElFormItem>
      </ElForm>
      
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="submitForm" :loading="loading">
          保存
        </ElButton>
      </template>
    </ElDialog>
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