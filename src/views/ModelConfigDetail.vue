<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElDialog } from 'element-plus';
import { Back } from '@element-plus/icons-vue';
import { updateConfig } from '../api/model';
import { getModelInfos } from '../api/model';
import { fetchOwnVectors } from '../api/vectorDb';
import { ModelConfig, ModelInfo } from '../types/model_config';
import type { VectorDbBase } from '../types/vectorDb';

const route = useRoute();
const configId = ref(Number(route.params.id));
const modelConfig = ref<ModelConfig | null>();
const baseModels = ref<ModelInfo[]>([]);
const vectorDbs = ref<VectorDbBase[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);

// 添加 customColors 计算属性
const customColors = computed(() => [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]);
const form = ref({
  name: modelConfig.value?.name || '',
  describe: modelConfig.value?.describe || '',
  base_model_id: modelConfig.value?.base_model_id || null,
  temperature: modelConfig.value ? Number(modelConfig.value.temperature) : 0.7,
  top_p: modelConfig.value ? Number(modelConfig.value.top_p) : 0.7,
  prompt: modelConfig.value?.prompt || '',
  vector_db_id: modelConfig.value?.vector_db_id || null,
  is_private: modelConfig.value?.is_private || false
});

const formRules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  base_model_id: [{ required: true, message: '请选择基础模型', trigger: 'change' }],
};

const handleEdit = () => {
  if (modelConfig.value) {
    form.value = {
      name: modelConfig.value.name,
      describe: modelConfig.value.describe || '',
      base_model_id: modelConfig.value.base_model_id,
      temperature: Number(modelConfig.value.temperature),
      top_p: Number(modelConfig.value.top_p),
      prompt: modelConfig.value.prompt || '',
      vector_db_id: modelConfig.value.vector_db_id || null,
      is_private: modelConfig.value.is_private
    };
  }
  dialogVisible.value = true;
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleSave = async () => {
  loading.value = true;
  try {
    const updated_config = await updateConfig({
      id: configId.value,
      ...form.value
    });
    modelConfig.value = updated_config;
    ElMessage.success('配置更新成功');
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error('配置更新失败');
  } finally {
    loading.value = false;
  }
};
const router = useRouter();
const gotoVectorDetail = (vectorId: number) => {
  router.push(`/database/${vectorId}`);
};

onMounted(async () => {
  baseModels.value = await getModelInfos();
  vectorDbs.value = await fetchOwnVectors();
  if (history.state?.config) {
    modelConfig.value = history.state.config;
  } else {
    // 如果没有通过 state 传递数据，可以执行其他获取数据的逻辑
    // fetchConfig();
  }
});
const goBack = () => router.go(-1);
</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <div class="header-section">
          <el-button @click="goBack" :icon="Back" type="text">返回上一页</el-button>
        <h2>模型配置详情</h2>
        <ElButton type="primary" @click="handleEdit" class="edit-btn">
          <i class="el-icon-edit"></i> 编辑配置
        </ElButton>
      </div>

      <div v-loading="loading">
        <div v-if="modelConfig" class="detail-view">
          <!-- 基本信息卡片 -->
          <ElCard shadow="hover" class="info-card">
            <div class="card-header">
              <el-icon><info-filled /></el-icon>
              <h3 class="section-title">基本信息</h3>
            </div>
            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">配置名称</span>
                <span class="detail-value">{{ modelConfig.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">基础模型</span>
                <span class="detail-value highlight">
                  {{ baseModels.find(m => m.id === modelConfig?.base_model_id)?.model_name || '未知模型' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">可见性</span>
                <span class="detail-value">
                  <ElTag :type="modelConfig.is_private ? 'warning' : 'success'" effect="dark">
                    {{ modelConfig.is_private ? '私有' : '公开' }}
                  </ElTag>
                </span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">描述</span>
                <span class="detail-value">{{ modelConfig.describe || '暂无描述' }}</span>
              </div>
            </div>
          </ElCard>

          <!-- 参数卡片 -->
          <div class="card-group">
            <ElCard shadow="hover" class="param-card">
              <div class="card-header">
                <el-icon><setting /></el-icon>
                <h3 class="section-title">模型参数</h3>
              </div>
              <div class="param-content">
                <div class="param-item">
                  <div class="param-info">
                    <span class="param-label">温度 (Temperature)</span>
                    <span class="param-value">{{ modelConfig.temperature }}</span>
                  </div>
                  <ElProgress 
                    :percentage="modelConfig.temperature * 100" 
                    :color="customColors" 
                    :show-text="false"
                    class="param-progress"
                  />
                </div>
                <div class="param-item">
                  <div class="param-info">
                    <span class="param-label">Top P</span>
                    <span class="param-value">{{ modelConfig.top_p }}</span>
                  </div>
                  <ElProgress 
                    :percentage="modelConfig.top_p * 100" 
                    :color="customColors" 
                    :show-text="false"
                    class="param-progress"
                  />
                </div>
              </div>
            </ElCard>

            <ElCard
              shadow="hover" 
              class="param-card vector-card"
              @click="modelConfig?.vector_db_id && gotoVectorDetail(modelConfig.vector_db_id)">
              <div class="card-header">
                <el-icon><data-board /></el-icon>
                <h3 class="section-title">向量数据库</h3>
              </div>
              <div class="vector-content">
                <div class="vector-item">
                  <span class="vector-name">
                    <el-icon><connection /></el-icon>
                    {{ vectorDbs.find(v => v.id === modelConfig?.vector_db_id)?.name || '未设置' }}
                  </span>
                  <p class="vector-describe">
                    {{ vectorDbs.find(v => v.id === modelConfig?.vector_db_id)?.describe || '暂无描述' }}
                  </p>
                  <span class="click-hint" v-if="modelConfig?.vector_db_id">点击查看详情 →</span>
                </div>
              </div>
            </ElCard>
          </div>

          <!-- 提示词卡片 -->
          <ElCard shadow="hover" class="prompt-card">
            <div class="card-header">
              <el-icon><chat-line-round /></el-icon>
              <h3 class="section-title">系统提示词</h3>
            </div>
            <div class="prompt-content">
              <pre class="prompt-text">{{ modelConfig.prompt || '未设置' }}</pre>
            </div>
          </ElCard>

          <!-- 元信息卡片 -->
          <ElCard shadow="hover" class="meta-card">
            <div class="meta-content">
              <div class="meta-item">
                <el-icon><timer /></el-icon>
                <span>最后更新: {{ new Date(modelConfig.updated_at).toLocaleString() }}</span>
              </div>
            </div>
          </ElCard>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      title="编辑模型配置"
      width="50%"
      :before-close="handleCancel"
    >
      <ElForm :model="form" :rules="formRules" label-width="120px" class="edit-form">
        <ElFormItem label="配置名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入配置名称" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="form.describe" placeholder="请输入描述" />
        </ElFormItem>
        <ElFormItem label="基础模型" prop="base_model_id">
          <ElSelect v-model="form.base_model_id" placeholder="请选择基础模型" style="width: 100%">
            <ElOption
              v-for="model in baseModels"
              :key="model.id"
              :label="model.model_name"
              :value="model.id"
            />
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
        <ElFormItem label="向量数据库">
          <ElSelect v-model="form.vector_db_id" placeholder="请选择向量数据库" style="width: 100%">
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
        <span class="dialog-footer">
          <ElButton @click="handleCancel">取消</ElButton>
          <ElButton type="primary" @click="handleSave" :loading="loading">保存</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px;
}

.back-link {
  text-decoration: none;
}
.edit-btn {
  padding: 10px 15px;
}

/* 卡片通用样式 */
.info-card,
.param-card,
.prompt-card,
.meta-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.info-card:hover,
.param-card:hover,
.prompt-card:hover,
.meta-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header i {
  margin-right: 10px;
  color: #409EFF;
}

.section-title {
  font-weight: 500;
  color: #303133;
  margin: 0;
}

/* 基本信息卡片 */
.detail-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.detail-item {
  flex: 1;
  min-width: 200px;
}

.detail-item.full-width {
  flex: 100%;
}

.detail-label {
  display: block;
  color: #909399;
  margin-bottom: 6px;
}

.detail-value {
  color: #303133;
  word-break: break-word;
  text-align: left;
}

.highlight {
  font-weight: 500;
  color: #409EFF;
}

/* 参数卡片组 */
.card-group {
  display: flex;
  gap: 20px;
}

.param-card {
  flex: 1;
}

.param-content {
  padding: 10px 0;
}

.param-item {
  margin-bottom: 20px;
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.param-label {
  color: #606266;
}

.param-value {
  font-weight: 500;
  color: #303133;
}

.param-progress {
  height: 6px;
  border-radius: 3px;
}

.vector-card {
  cursor: pointer;
  transition: all 0.3s;
}

.vector-card:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.2);
}

.card-header {
  position: relative;
}

.info-icon {
  margin-left: 8px;
  font-size: 16px;
  color: #909399;
}

.vector-item {
  position: relative;
}

.click-hint {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 12px;
  color: #409EFF;
  opacity: 0;
  transition: opacity 0.3s;
}

.vector-card:hover .click-hint {
  opacity: 1;
}

/* 向量数据库卡片 */
.vector-content {
  padding: 10px 0;
}

.vector-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.vector-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.vector-describe {
  font-size: 0.9rem;
  color: #909399;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vector-item i {
  color: #67C23A;
}

/* 提示词卡片 */
.prompt-card {
  min-height: 200px;
}

.prompt-content {
  padding: 10px 0;
}

.prompt-text {
  font-size: 0.8rem;
  color: #333;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
  border-left: 3px solid #409EFF;
  text-align: left;
}

/* 元信息卡片 */
.meta-card {
  background-color: #f5f7fa;
}

.meta-content {
  padding: 10px 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #909399;
}

.meta-item i {
  font-size: 16px;
}
</style>