<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Plus, Refresh } from '@element-plus/icons-vue';
import { ModelConfig, ModelInfo } from '../types/model_config';
import type { VectorDbBase } from '../types/vectorDb';
import type { ModelConfigForm } from '../types/model_config';
import { getModelInfos, createConfig, fetchOwnConfigs, updateConfig, deleteModelConfig } from '../api/model';
import { fetchOwnVectors } from '../api/vectorDb';
import ModelConfigCard from '@/components/ModelConfigCard.vue';
import { confirmAction } from '../utils/confirm';

const baseModels = ref<ModelInfo[]>([]);
const vectorDbs = ref<VectorDbBase[]>([]);
const modelConfigs = ref<ModelConfig[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const dialogVisible = ref(false);
// const currentPage = ref(1);
// const pageSize = ref(16);
const totalItems = ref(0);

const form = ref<ModelConfigForm>({
  id: null,
  name: '',
  describe: '',
  base_model_id: null,
  temperature: 0.7,
  top_p: 0.7,
  prompt: '',
  vector_db_id: null,
  is_private: false
});

const formRules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  base_model_id: [{ required: true, message: '请选择基础模型', trigger: 'change' }],
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const data = await fetchOwnConfigs();
    modelConfigs.value = data;
    totalItems.value = data.length;
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
    base_model_id: null,
    temperature: 0.7,
    top_p: 0.7,
    prompt: '',
    vector_db_id: null,
    is_private: false
  };
};

// 打开创建对话框
const handleCreate = () => {
  initForm();
  dialogVisible.value = true;
};


// 提交表单
const submitForm = async () => {
  loading.value = true;
  try {
    if (form.value.id) {
      await updateConfig(form.value);
    } else {
      await createConfig(form.value);
    }
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    loading.value = false;
  }
};

// 删除配置
const handleDelete = async (id: number) => {
  try {
    await confirmAction('确定要删除此配置吗？');
    await deleteModelConfig(id);
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

onMounted(async() => {
  baseModels.value = await getModelInfos();
  vectorDbs.value = await fetchOwnVectors();
  loadData();
});
</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <h2>模型配置管理</h2>
      <p class="subtitle">创建和管理您的个性化模型配置</p>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="action-buttons"> 
          <ElButton type="primary" :icon="Plus" @click="handleCreate">新建配置</ElButton>
          <ElButton :icon="Refresh" @click="loadData">刷新</ElButton>
        </div>
        <div class="search-container">
          <ElInput
            v-model="searchQuery"
            placeholder="搜索配置名称..."
            clearable
            class="search-input"
          >
            <template #append>
              <ElButton :icon="Search" />
            </template>
          </ElInput>
        </div>
      </div>
      
      <!-- 配置卡片网格 -->
      <div class="model-grid" v-loading="loading">
        <ModelConfigCard
          v-for="config in modelConfigs"
          :key="config.id"
          :config="config"
          :base-model-name="baseModels.find(m => m.id === config.base_model_id)?.model_name"
          @delete="handleDelete"
        />
      </div>
      
      <!-- 分页 -->
      <!-- <ElPagination
        class="pagination"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalItems"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
      /> -->
    </div>
    
    <!-- 配置表单对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="form.id ? '编辑配置' : '新建配置'"
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
        <ElFormItem label="配置名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入配置名称" />
        </ElFormItem>
        
        <ElFormItem label="描述" prop="describe"> 
          <ElInput v-model="form.describe" placeholder="请输入描述" />
        </ElFormItem>
        <ElFormItem label="基础模型" prop="base_model_id">
          <ElSelect
            v-model="form.base_model_id"
            placeholder="请选择基础模型"
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
                <span class="model-describe">{{ model.describe }}</span>
              </div>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        
        <ElFormItem label="温度">
          <ElSlider
            v-model="form.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </ElFormItem>
        
        <ElFormItem label="Top P">
          <ElSlider
            v-model="form.top_p"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </ElFormItem>
        
        <ElFormItem label="向量数据库" prop="vector_db_id">
          <ElSelect
            v-model="form.vector_db_id"
            placeholder="请选择向量数据库"
            style="width: 100%"
          >
            <ElOption
              v-for="db in vectorDbs"
              :key="db.id"
              :label="db.name"
              :value="db.id"
            />
          </ElSelect>
        </ElFormItem>
        
        <ElFormItem label="系统提示词">
          <ElInput
            v-model="form.prompt"
            type="textarea"
            :rows="4"
            placeholder="请输入系统提示词..."
          />
        </ElFormItem>
        
        <ElFormItem label="可见性">
          <ElRadioGroup v-model="form.is_private">
            <ElRadio :label="false">公开</ElRadio>
            <ElRadio :label="true">私有</ElRadio>
          </ElRadioGroup>
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
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
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
    /* min-width: 1068px; */
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
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
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

.dialog-form :deep(.el-input__inner),
.dialog-form :deep(.el-textarea__inner),
.dialog-form :deep(.el-radio__label) {
  font-size: 1.1em;
}

.dialog-form :deep(.el-select-dropdown__item) {
  font-size: 1.1em;
}

.dialog-form :deep(.el-slider__button) {
  font-size: 1.1em;
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