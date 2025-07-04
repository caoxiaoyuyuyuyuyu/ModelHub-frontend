<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Plus, Refresh, Folder } from '@element-plus/icons-vue';
import type { LocalModel, OllamaModel } from '../types/model';
import { fetchLocalModels, createBaseModel, AddOllamaModels } from '../api/fintuning';
import { fetchOllamaModels, updateOllamaModelConfig, deleteOllamaModelConfig, createOllamaModelConfig } from '../api/model';
import { ElMessage,ElMessageBox } from 'element-plus';
import { ElInputNumber } from 'element-plus';
import { useRouter } from 'vue-router';
// Add these functions inside the script setup
const handleEdit = (config: any) => {
  editingConfig.value = config;
  editForm.value = {
    name: config.name,
    base_model_id: config.base_model_id,
    temperature: config.temperature,
    num_keep: config.num_keep,
    num_predict: config.num_predict,
    top_p: config.top_p,
    top_k: config.top_k,
    describe: config.describe
  };
  showEditModal.value = true;
};
const handleAddConfig = () => {
  editingConfig.value = null;
  if (selectedModel.value){
    editForm.value = {
      base_model_id: selectedModel.value.id,
      name: '',
      temperature: 0.7,
      num_keep: 1024,
      num_predict: 1024,
      top_p: 0.7,
      top_k: 40,
      describe: ''
    };}
  showEditModal.value = true;
};
const submitAdd = async () => { 
  console.log('submitAdd');
  try {
    loading.value.configs = true;
    // Here you would typically call an API to update the config
    try {
      const res = await createOllamaModelConfig(editForm.value);
      const ollamaModelsIndex = ollamaModels.value.findIndex(item => item.id === res.base_model_id);
      ollamaModels.value[ollamaModelsIndex].model_configs.push(res);
      ElMessage.success('配置创建成功');
      showEditModal.value = false;
    } catch (error) {
      ElMessage.error('创建失败');
      console.error('Error updating config:', error);
    }
  } catch (error) {
    console.error('创建配置失败:', error);
    ElMessage.error('创建配置失败');
  } finally {
    loading.value.configs = false;
  }
};
const submitEdit = async () => {
  try {
    loading.value.configs = true;
    // Here you would typically call an API to update the config
    try {
      const res = await updateOllamaModelConfig(editingConfig.value.id, editForm.value);
      editForm.value = res;
      editingConfig.value = res;
      const ollamaModelsIndex = ollamaModels.value.findIndex(item => item.id === res.base_model_id);
      const configIndex = ollamaModels.value[ollamaModelsIndex].model_configs.findIndex(item => item.id === res.id);
      ollamaModels.value[ollamaModelsIndex].model_configs[configIndex] = res;
      ElMessage.success('配置更新成功');
      showEditModal.value = false;
    } catch (error) {
      ElMessage.error('更新失败');
      console.error('Error updating config:', error);
    }
  } catch (error) {
    console.error('更新配置失败:', error);
    ElMessage.error('更新配置失败');
  } finally {
    loading.value.configs = false;
  }
};
const handleDelete = async (config: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置 "${config.name}" 吗?`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    ElMessage.success(`配置 "${config.name}" 已删除`);
    // Here you would typically call an API to delete the config
    try {
      await deleteOllamaModelConfig(config.id);
      const ollamaModelsIndex = ollamaModels.value.findIndex(item => item.id === config.base_model_id);
      const configIndex = ollamaModels.value[ollamaModelsIndex].model_configs.findIndex(item => item.id === config.id);
      ollamaModels.value[ollamaModelsIndex].model_configs.splice(configIndex, 1);
    }catch (error) {
      console.error('删除模型配置失败:', error);
      ElMessage.error('删除模型配置失败');
    }
    

    // Then refresh the data
    // loadData();
  } catch (error) {
    ElMessage.info('删除操作已取消');
  }
};
const handleUseModelConfig = async (config: any) => { 
  router.push({
    path: '/intro',
    query: {
      config_name: config.name,
      model_config_id: config.id,
      model_type: 'ollama_config'
    }
  });
};

// Add to your existing state
const showEditModal = ref(false);
const editingConfig = ref<any>(null);
const editForm = ref({
  name: '',
  base_model_id: 0,
  temperature: 0,
  num_keep: 0,
  num_predict: 0,
  top_p: 0,
  top_k: 0,
  describe: ''
});

// 状态管理
const baseModels = ref<LocalModel[]>([]);
const ollamaModels = ref<OllamaModel[]>([]);
const loading = ref({
  list: false,   // 列表加载状态
  form: false,   // 表单提交状态
  detail: false,  // 详情加载状态
  configs: false
});
const searchQuery = ref('');
const activeTab = ref('base'); // 'base' or 'ollama'

// Modal controls
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const selectedModel = ref<LocalModel | OllamaModel | null>(null);

// Form data
const newModel = ref({
  name: '',
  describe: '',
  type: 'chatllm'
});

// 加载数据（增加错误处理和重试机制）
const loadData = async () => {
  try {
    loading.value.list = true;
    if (activeTab.value === 'base') {
      baseModels.value = await fetchLocalModels();
    } else {
      ollamaModels.value = await fetchOllamaModels();
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载模型列表失败，请重试');
  } finally {
    loading.value.list = false;
  }
};

// Tab切换
const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  loadData();
};

// 打开创建模态框
const handleCreateModel = () => {
  showCreateModal.value = true;
};

// 提交新模型（优化加载状态管理和错误处理）
const submitModel = async () => {
  if (!newModel.value.name.trim()) {
    ElMessage.warning('请输入模型名称');
    return;
  }
  
  try {
    loading.value.form = true;
    const formData = new FormData();
    formData.append('name', newModel.value.name);
    formData.append('describe', newModel.value.describe);
    formData.append('type', newModel.value.type);
    if (activeTab.value === 'base') { 
      await createBaseModel(formData);
    }else{
      await AddOllamaModels(formData);
    }
    
    ElMessage.success('模型创建成功');
    newModel.value = { name: '', describe: '', type: 'chatllm' };
    showCreateModal.value = false;
    await loadData(); // 刷新列表
  } catch (error) {
    console.error('创建模型失败:', error);
    ElMessage.error('创建模型失败，请重试');
  } finally {
    loading.value.form = false;
  }
};

// 显示模型详情（增加加载状态）
const handleDetail = async (model: LocalModel | OllamaModel) => {
  try {
    loading.value.detail = true;
    selectedModel.value = model;
    showDetailModal.value = true;
  } catch (error) {
    console.error('加载详情失败:', error);
    ElMessage.error('加载模型详情失败');
  } finally {
    loading.value.detail = false;
  }
};

const router = useRouter();
const handleUseModel = (id: number, name: string) => { 
  console.log('使用模型:', activeTab.value);
  router.push({
    path: '/intro',
    query: {
      config_name: name,
      model_config_id: id,
      model_type: activeTab.value === 'base' ? 'base' : 'ollama'
    }
  });
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <div class="header-section">
        <h2><el-icon :size="24" style="vertical-align: middle; margin-right: 8px;"><Folder /></el-icon>本地模型</h2>
        <p class="subtitle">管理您的本地模型</p>
      </div>
      
      <!-- Action bar -->
      <div class="action-bar">
        <div class="action-buttons"> 
          <ElButton 
            type="primary" 
            :icon="Plus" 
            @click="handleCreateModel" 
            class="create-button"
          >
            添加模型
          </ElButton>
          <ElButton :icon="Refresh" @click="loadData" v-loading="loading.list">刷新</ElButton>
        </div>
        <div class="search-container">
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
        </div>
      </div>
      
      <!-- Tabs -->
      <el-tabs style="background: #fff;" v-model="activeTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane label="基础模型" name="base"></el-tab-pane>
        <el-tab-pane label="Ollama模型" name="ollama"></el-tab-pane>
      </el-tabs>
      
      <!-- Model grid -->
      <div class="model-grid" v-loading="loading.list">
        <!-- Base Models -->
        <template v-if="activeTab === 'base'">
          <div class="model-card" v-for="model in baseModels" :key="model.id">
            <div class="card-header">
              <div class="model-info">
                <h3>{{ model.name }}</h3>
              </div>
              <ElTag size="large" type="info">
                {{ model.type }}
              </ElTag>
            </div>
            
            <div class="description-area">
              <p class="description">{{ model.describe || '暂无描述' }}</p>
            </div>
            
            <div class="card-footer">
              <div class="author-date">
                <span class="date">创建于: {{ model.created_at }}</span>
              </div>
              <div class="actions">
                <ElButton type="primary" size="large" @click="handleDetail(model)">查看详情</ElButton>
                <ElButton type="primary" size="large" @click="handleUseModel(model.id, model.name)">使用</ElButton>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Ollama Models -->
        <template v-else>
          <div class="model-card" v-for="model in ollamaModels" :key="model.id">
            <div class="card-header">
              <div class="model-info">
                <h3>{{ model.model_name }}</h3>
                <ElTag v-if="model.supplier" size="large" type="info">
                  {{ model.supplier }}
                </ElTag>
              </div>
            </div>
            
            <div class="description-area">
              <p class="description">{{ model.describe || '暂无描述' }}</p>
            </div>
            
            <div class="card-footer">
              <div class="author-date">
                <span class="date">配置数量 ：{{ model.model_configs?.length || 0 }}</span>
                <!-- <span class="date">更新于: {{ model.update_at }}</span> -->
              </div>
              <div class="actions">
                <ElButton type="primary" size="large" @click="handleDetail(model)">查看详情</ElButton>
                <ElButton type="primary" size="large" @click="handleUseModel(model.id, model.model_name)">使用</ElButton>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Create Model Modal -->
    <ElDialog v-model="showCreateModal" title="添加本地模型" width="50%" v-loading="loading.form">
      <ElForm :model="newModel" label-width="120px">
        <ElFormItem label="模型名称" required>
          <ElInput v-model="newModel.name" placeholder="请输入模型名称" />
        </ElFormItem>
        <ElFormItem label="模型描述">
          <ElInput v-model="newModel.describe" type="textarea" placeholder="请输入模型描述" />
        </ElFormItem>
        <ElFormItem label="模型类型">
          <ElSelect v-model="newModel.type">
            <ElOption label="语言模型" value="chatllm" />
            <ElOption label="嵌入模型" value="embedding" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showCreateModal = false">取消</ElButton>
          <ElButton type="primary" @click="submitModel" v-loading="loading.form">确认</ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- Model Detail Modal -->
    <ElDialog v-model="showDetailModal" :title="(selectedModel as LocalModel)?.name || (selectedModel as OllamaModel)?.model_name || '模型详情'" width="70%" v-loading="loading.detail">
      <div v-if="selectedModel" class="model-detail">
        <template v-if="activeTab === 'base'">
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="模型名称">{{ (selectedModel as LocalModel).name }}</ElDescriptionsItem>
            <ElDescriptionsItem label="模型路径">{{ (selectedModel as LocalModel).path }}</ElDescriptionsItem>
            <ElDescriptionsItem label="模型类型">{{ (selectedModel as LocalModel).type }}</ElDescriptionsItem>
            <ElDescriptionsItem label="创建时间">{{ (selectedModel as LocalModel).created_at }}</ElDescriptionsItem>
            <ElDescriptionsItem label="模型描述">{{ (selectedModel as LocalModel).describe || '暂无描述' }}</ElDescriptionsItem>
          </ElDescriptions>
        </template>
        <template v-else>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="模型名称">{{ (selectedModel as OllamaModel).model_name }}</ElDescriptionsItem>
            <ElDescriptionsItem label="供应商">{{ (selectedModel as OllamaModel).supplier || '未知' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="模型描述">{{ (selectedModel as OllamaModel).describe || '暂无描述' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="配置数量">{{ (selectedModel as OllamaModel).model_configs?.length || 0 }}</ElDescriptionsItem>
          </ElDescriptions>

          <div v-if="(selectedModel as OllamaModel).model_configs?.length" class="config-section">
            <h3 style="margin-top: 20px; margin-bottom: 15px;">相关配置</h3>
            <ElTable :data="(selectedModel as OllamaModel).model_configs" border style="width: 100%" v-loading="loading.configs">
              <ElTableColumn prop="name" label="配置名称" width="180">
                <template #header>
                  <span>配置名称 <el-tooltip content="该配置的自定义名称" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="temperature" label="Temperature" width="100">
                <template #header>
                  <span>Temperature <el-tooltip content="控制生成文本的随机性，值越高结果越随机" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="num_keep" label="num Keep" width="100">
                <template #header>
                  <span>num Keep <el-tooltip content="保留在上下文中的token数量" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="num_predict" label="num Predict" width="100">
                <template #header>
                  <span>num Predict <el-tooltip content="最大预测token数量" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="top_p" label="Top P" width="100">
                <template #header>
                  <span>Top P <el-tooltip content="核采样概率阈值，控制生成多样性" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="top_k" label="Top K" width="100">
                <template #header>
                  <span>Top K <el-tooltip content="限制采样范围到最可能的K个token" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="describe" label="描述">
                <template #header>
                  <span>描述 <el-tooltip content="该配置的详细说明" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="create_at" label="创建时间" width="180">
                <template #header>
                  <span>创建时间 <el-tooltip content="该配置的创建日期和时间" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="update_at" label="更新时间" width="180">
                <template #header>
                  <span>更新时间 <el-tooltip content="该配置的最后修改日期和时间" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
              </ElTableColumn>
              <!-- 操作列 -->
              <ElTableColumn label="操作">
                <template v-slot="scope">
                  <ElButton type="primary" size="mini" @click="handleEdit(scope.row)">编辑</ElButton>
                  <ElButton type="danger" size="mini" @click="handleDelete(scope.row)">删除</ElButton>
                  <ElButton type="warning" size="mini" @click="handleUseModelConfig(scope.row)">使用</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
          <div v-else style="margin-top: 20px; text-align: center;">
            <el-empty description="暂无相关配置" />
          </div>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton 
            type="primary" 
            @click="handleAddConfig"
          >
            添加配置
          </ElButton>
          <ElButton type="warning" @click="showDetailModal = false">关闭</ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- Edit Config Modal -->
    <ElDialog v-model="showEditModal" title="编辑配置" width="50%" v-loading="loading.configs">
      <ElForm :model="editForm" label-width="120px">
        <ElFormItem label="配置名称">
          <ElInput v-model="editForm.name" placeholder="请输入配置名称" />
        </ElFormItem>
        <ElFormItem label="Temperature">
          <ElInputNumber 
            v-model="editForm.temperature" 
            :min="0" 
            :max="2" 
            :step="0.1" 
            controls-position="right" 
          />
          <span class="form-tip">(0-2，控制生成随机性)</span>
        </ElFormItem>
        <ElFormItem label="num Keep">
          <ElInputNumber 
            v-model="editForm.num_keep" 
            :min="0" 
            :max="2048" 
            controls-position="right" 
          />
          <span class="form-tip">(保留在上下文中的token数量)</span>
        </ElFormItem>
        <ElFormItem label="num Predict">
          <ElInputNumber 
            v-model="editForm.num_predict" 
            :min="0" 
            :max="4096" 
            controls-position="right" 
          />
          <span class="form-tip">(最大预测token数量)</span>
        </ElFormItem>
        <ElFormItem label="Top P">
          <ElInputNumber 
            v-model="editForm.top_p" 
            :min="0" 
            :max="1" 
            :step="0.05" 
            controls-position="right" 
          />
          <span class="form-tip">(0-1，核采样概率阈值)</span>
        </ElFormItem>
        <ElFormItem label="Top K">
          <ElInputNumber 
            v-model="editForm.top_k" 
            :min="0" 
            :max="100" 
            controls-position="right" 
          />
          <span class="form-tip">(限制采样范围到最可能的K个token)</span>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput 
            v-model="editForm.describe" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入配置描述" 
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showEditModal = false">取消</ElButton>
          <ElButton type="primary" v-if="editingConfig" @click="submitEdit">{{"保存"}}</ElButton>
          <ElButton type="primary" v-else @click="submitAdd">{{"创建"}}</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
/* Add this to your existing styles */
.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

/* Make number inputs take full width */
.el-input-number {
  width: 100%;
}
/* Add new styles for config section */
.config-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
/* Reusing most styles from the fine-tuning page */
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

.create-button {
  background: #409eff;
  border: none;
  color: #ffffff;
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
  max-width: 500px;
  background: radial-gradient(26% 84% at 4% 4%, rgba(216, 219, 231, 0.3) 0%, rgba(232, 236, 242, 0) 94%), #fff;
}

.model-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #a8edea;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.model-info { 
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.model-detail {
  padding: 20px;
}

/* Responsive grid */
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

/* Tabs styling */
.el-tabs {
  margin-bottom: 20px;
}

.el-tabs__item {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}
:deep(.el-tabs__header){
    margin: 0;
}
</style>