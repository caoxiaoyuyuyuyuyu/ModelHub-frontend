<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Edit, Delete, Plus, Refresh } from '@element-plus/icons-vue';
import { ModelConfig, ModelInfo } from '../types/model_config';
import type { VectorDbBase } from '../types/vectorDb';
import type { ModelConfigForm } from '../types/model_config';
import { getModelInfos, createConfig, fetchOwnConfigs, updateConfig, deleteModelConfig } from '../api/model';
import { fetchOwnVectors } from '../api/vectorDb';

const baseModels = ref<ModelInfo[]>([]);

const vectorDbs = ref<VectorDbBase[]>([]);

const modelConfigs = ref<ModelConfig[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const dialogVisible = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(20);

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
  share_id: [{ required: true, message: '请输入分享ID', trigger: 'blur' }],
  base_model_id: [{ required: true, message: '请选择基础模型', trigger: 'change' }],
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    modelConfigs.value = await fetchOwnConfigs();
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

// 打开编辑对话框
const handleEdit = (config: ModelConfig) => {
    console.log('编辑配置', config);
    form.value = {
      id: config.id,
      name: config.name,
      describe: config.describe,
      base_model_id: config.base_model_id,
      temperature: Number(config.temperature),
      top_p: Number(config.top_p),
      prompt: config.prompt,
      vector_db_id: config.vector_db_id,
      is_private: config.is_private
    };
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  loading.value = true;
  try {
    console.log('提交表单', form.value);
    if (form.value.id) {
      // 更新配置
      await updateConfig(form.value);
    } else {
      // 创建配置
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
    await deleteModelConfig(id);
    console.log('删除成功', id);
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
      <!-- 配置表格 -->
      <div class="table-container">
        <ElTable
            :data="modelConfigs"
            v-loading="loading"
            border
            fit="true"
            stripe
            table-layout="auto"
            style="font-size: 1.1rem"
        >
            <ElTableColumn prop="name" label="配置名称" show-overflow-tooltip />
            <ElTableColumn prop="describe" label="描述" show-overflow-tooltip />
            <ElTableColumn prop="base_model_id" label="基础模型" show-overflow-tooltip>
              <template #default="{ row }">
                {{ baseModels.find(model => model.id === row.base_model_id)?.model_name }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="参数设置">
              <template #default="{ row }">
                  <div class="params">
                  <span>温度: {{ row.temperature }}</span>
                  <span>Top P: {{ row.top_p }}</span>
                  </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="vector_db_id" label="向量数据库" show-overflow-tooltip>
              <template #default="{ row }">
                {{ vectorDbs.find(vectorDb => vectorDb.id === row.vector_db_id)?.name }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="is_private" label="可见性">
              <template #default="{ row }">
                  <ElTag :type="row.is_private ? 'danger' : 'success'">
                  {{ row.is_private ? '私有' : '公開' }}
                  </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="share_id" label="分享ID" show-overflow-tooltip />
            <ElTableColumn prop="updated_at" label="更新时间" show-overflow-tooltip />
            <ElTableColumn label="操作" fixed="right" width="120">
              <template #default="{ row }">
                  <ElButton
                  type="primary"
                  :icon="Edit"
                  size="small"
                  circle
                  @click="handleEdit(row)"
                  />
                  <ElButton
                  type="danger"
                  :icon="Delete"
                  size="small"
                  circle
                  @click="handleDelete(row.id)"
                  />
              </template>
            </ElTableColumn>
        </ElTable>
      </div>
      
      <!-- 分页 -->
      <ElPagination
        class="pagination"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalItems"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
      />
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

.params {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.params span {
  font-size: 0.9em;
  color: #666;
}

.table-container {
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

/* 对话框表单样式 */
.dialog-form {
  font-size: 1.1em;  /* 比基础字体大10% */
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

/* 如果需要调整滑块标签 */
.dialog-form :deep(.el-slider__button) {
  font-size: 1.1em;
}
/* Add these new styles for table cell text truncation */
:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* Optional: Adjust column widths for better truncation behavior */
:deep(.el-table__body) {
  table-layout: fixed;
}

/* Keep the params display as column layout */
.params {
  display: flex;
  flex-direction: column;
  gap: 4px;
  white-space: normal; /* Allow params to wrap normally */
}
</style>