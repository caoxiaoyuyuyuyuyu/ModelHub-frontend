<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Connection, Delete, Edit, Back, Upload } from '@element-plus/icons-vue';
import type { VectorDbForm } from '../types/vectorDb';
import { getVectorDb, uploadDocument, deleteDocument } from '../api/vectorDb';
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteModelConfig } from '../api/model';

const route = useRoute();
const loading = ref(true);
const uploadLoading = ref(false);
const vectorDbId = ref<number>(parseInt(route.params.id as string));

// 数据库基本信息
const vectorDb = ref<VectorDbForm>({
  id: 0,
  name: '',
  describe: '',
  embedding_id: 0,
  document_similarity: 0,
  created_at: '',
  updated_at: '',
  model_configs: [],
  documents: []
});

// 上传文件相关
const uploadDialogVisible = ref(false);
const uploadFormRef = ref();
const uploadForm = ref({
  file: null as File | null,
  describe: ''
});

// 上传规则验证
const uploadRules = {
  file: [
    { required: true, message: '请选择要上传的文件', trigger: 'change' }
  ],
  describe: [
    { required: true, message: '请输入文件描述', trigger: 'blur' }
  ]
};

// 获取数据库详情
const fetchVectorDbDetail = async () => {
  loading.value = true;
  try {
    vectorDb.value = await getVectorDb(vectorDbId.value);
    loading.value = false;
  } catch (error) {
    console.error('获取数据库详情失败:', error);
    loading.value = false;
  }
};

const handleDeleteModelConfig = async (modelConfigId: number) => { 
  try {
    await deleteModelConfig(modelConfigId);
    ElMessage.success('模型配置删除成功');
    fetchVectorDbDetail();
  } catch (error) {
    console.error('删除模型配置失败:', error);
    ElMessage.error('删除模型配置失败');
  }
};

// 处理文件选择
const handleFileChange = (uploadFile : any) => {
  // 确保获取的是原生File对象
  uploadForm.value.file = uploadFile.raw || uploadFile;
  return false; // 阻止自动上传
};

// 提交上传表单
const submitUpload = async () => {
  try {
    await uploadFormRef.value.validate();
    
    if (!uploadForm.value.file) {
      ElMessage.error('请选择要上传的文件');
      return;
    }
    
    uploadLoading.value = true;
    
    const formData = new FormData();
    formData.append('file', uploadForm.value.file);
    formData.append('describe', uploadForm.value.describe);
    formData.append('vector_db_id', vectorDbId.value.toString());
    
    // 调试输出 - 确认文件类型
    console.log('文件对象类型:', uploadForm.value.file.constructor.name);
    console.log('文件详情:', {
      name: uploadForm.value.file.name,
      size: uploadForm.value.file.size,
      type: uploadForm.value.file.type
    });
    
    
    const newDocument = await uploadDocument(formData);
    
    // 更新本地文档列表
    vectorDb.value.documents.push(newDocument);
    
    ElMessage.success('文档上传成功');
    uploadDialogVisible.value = false;
    resetUploadForm();
  } catch (error) {
    console.error('上传文档失败:', error);
    ElMessage.error('上传文档失败');
  } finally {
    uploadLoading.value = false;
  }
};

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.value = {
    file: null,
    describe: ''
  };
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields();
  }
};

// 删除文档
const handleDeleteDocument = async (docId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此文档吗？删除后无法恢复', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await deleteDocument(docId);
    
    // 更新本地文档列表
    vectorDb.value.documents = vectorDb.value.documents.filter(
      doc => doc.id !== docId
    );
    
    ElMessage.success('文档删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文档失败:', error);
      ElMessage.error('删除文档失败');
    }
  }
};

// 下载文档
const handleDownloadDocument = (id: number) => {
  // 这里假设后端返回了可以直接下载的URL
  const downloadUrl = `/api/documents/download/${id}`;
  window.open(downloadUrl, '_blank');
};

onMounted(() => {
  fetchVectorDbDetail();
});
</script>

<template>
  <div class="page-container" v-loading="loading">
    <div class="content-section">
      <!-- 返回按钮和标题 -->
      <div class="header-section">
        <router-link to="/database" class="back-link">
          <el-button :icon="Back" type="text">返回列表</el-button>
        </router-link>
        <h2>向量数据库详情</h2>
      </div>
      
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <div class="title-section">
            <el-icon class="icon">
              <Connection />
            </el-icon>
            <h3>{{ vectorDb.name }}</h3>
            <el-tag type="success" effect="plain" size="large">运行中</el-tag>
          </div>
          <div class="actions">
            <el-button type="primary" :icon="Edit" size="large">编辑</el-button>
            <el-button type="danger" :icon="Delete" size="large">删除</el-button>
          </div>
        </div>
        
        <div class="card-content">
          <p class="description">{{ vectorDb.describe }}</p>
          
          <div class="metadata-grid">
            <div class="meta-item">
              <span class="meta-label">数据库ID</span>
              <span class="meta-value">{{ vectorDb.id }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创建时间</span>
              <span class="meta-value">{{ vectorDb.created_at }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新时间</span>
              <span class="meta-value">{{ vectorDb.updated_at }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">关联模型</span>
              <span class="meta-value">{{ vectorDb.model_configs.length }}个</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">存储文档</span>
              <span class="meta-value">{{ vectorDb.documents.length }}个</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 标签页 -->
      <el-tabs type="border-card" class="detail-tabs">
        <!-- 关联模型配置标签页 -->
        <el-tab-pane label="关联模型配置">
          <div class="tab-content">
            <div class="action-bar">
              <el-button type="primary" size="large">添加模型配置</el-button>
            </div>
            
            <el-table :data="vectorDb.model_configs" style="width: 100%" border>
              <el-table-column prop="name" label="配置名称" width="180" />
              <el-table-column prop="describe" label="描述" />
              <el-table-column prop="is_private" label="私有" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.is_private ? 'danger' : 'success'" size="large">
                    {{ row.is_private ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="updated_at" label="更新时间" width="180" />
              <el-table-column label="操作" width="180">
                <template #default="{ row }">
                  <el-button type="primary" size="large">查看</el-button>
                  <el-button type="danger" size="large" @click="handleDeleteModelConfig(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 存储文档标签页 -->
        <el-tab-pane label="存储文档">
          <div class="tab-content">
            <div class="action-bar">
              <el-button 
                type="primary" 
                size="large"
                :icon="Upload"
                @click="uploadDialogVisible = true"
              >
                上传文档
              </el-button>
            </div>

              <!-- 上传文档对话框 -->
              <el-dialog
                v-model="uploadDialogVisible"
                title="上传文档"
                @closed="resetUploadForm"
              >
                <el-form
                  ref="uploadFormRef"
                  :model="uploadForm"
                  :rules="uploadRules"
                  label-width="80px"
                >
                  <el-form-item label="文件" prop="file">
                    <el-upload
                      class="upload-demo"
                      drag
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="handleFileChange"
                    >
                      <el-icon class="el-icon--upload"><upload /></el-icon>
                      <div class="el-upload__text">
                        拖拽文件到此处或<em>点击选择文件</em>
                      </div>
                      <template #tip>
                        <div class="el-upload__tip">
                          支持PDF、Word、TXT等文档格式，大小不超过50MB
                        </div>
                      </template>
                    </el-upload>
                    <div v-if="uploadForm.file" class="file-info">
                      <el-icon><document /></el-icon>
                      {{ uploadForm.file.name }} ({{ (uploadForm.file.size / 1024 / 1024).toFixed(2) }} MB)
                    </div>
                  </el-form-item>
                  
                  <el-form-item label="描述" prop="describe">
                    <el-input
                      v-model="uploadForm.describe"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入文档描述"
                    />
                  </el-form-item>
                </el-form>
                
                <template #footer>
                  <el-button @click="uploadDialogVisible = false">取消</el-button>
                  <el-button
                    type="primary"
                    :loading="uploadLoading"
                    @click="submitUpload"
                  >
                    上传
                  </el-button>
                </template>
              </el-dialog>
            
            <el-table :data="vectorDb.documents" style="width: 100%" border>
              <el-table-column prop="orignal_name" label="文档名称" width="220" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag effect="plain">{{ row.type.toUpperCase() }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="size" label="大小" width="120">
                <template #default="{ row }">
                  {{ (row.size / 1024 / 1024).toFixed(2) }} MB
                </template>
              </el-table-column>
              <el-table-column prop="describe" label="描述" />
              <el-table-column prop="upload_at" label="上传时间" width="180" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="large" @click="handleDownloadDocument(row.id)">下载</el-button>
                  <el-button 
                    type="danger" 
                    size="large" 
                    @click="handleDeleteDocument(row.id)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 连接信息标签页 -->
        <el-tab-pane label="连接信息">
          <div class="tab-content">
            <div class="connection-info">
              <h4>API 端点</h4>
              <el-input 
                value="https://api.example.com/vector-db/12345" 
                readonly 
                class="connection-input"
              >
                <template #append>
                  <el-button>复制</el-button>
                </template>
              </el-input>
              
              <h4>连接代码示例</h4>
              <pre class="code-block">
import VectorDBClient from 'vector-db-sdk';

const client = new VectorDBClient({
  endpoint: 'https://api.example.com/vector-db/12345',
  apiKey: 'your_api_key_here'
});

// 查询示例
const results = await client.query({
  vector: [0.1, 0.2, 0.3, ...],
  top_k: 5
});</pre>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.back-link {
  text-decoration: none;
}

.info-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: radial-gradient(26% 84% at 4% 4%, rgba(216, 219, 231, 0.2) 0%, rgba(232, 236, 242, 0) 94%), #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-section h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #303133;
}

.icon {
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 50%;
  padding: 8px;
  font-size: 1.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.description {
  color: #606266;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 0.85rem;
  color: #909399;
  margin-bottom: 0.25rem;
}

.meta-value {
  font-size: 0.95rem;
  color: #303133;
  font-weight: 500;
}

.detail-tabs {
  margin-top: 1.5rem;
}

.tab-content {
  padding: 1rem;
}

.action-bar {
  margin-bottom: 1rem;
}

.connection-info {
  padding: 0.5rem;
}

.connection-info h4 {
  margin: 1rem 0 0.5rem;
  color: #606266;
  font-weight: 500;
}

.connection-input {
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.code-block {
  background-color: #f5f7fa;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  line-height: 1.5;
  margin: 0;
}

/* 调整标签页文字大小 */
:deep(.el-tabs__item) {
  font-size: 1rem; /* 调整为合适的大小 */
  padding: 0 20px; /* 可选：调整标签项的左右内边距 */
}

/* 如果需要调整活动标签的样式 */
:deep(.el-tabs__item.is-active) {
  font-weight: bold;
  color: #409eff; /* 活动标签颜色 */
}

/* 调整标签内容区域的文字大小 */
:deep(.el-tab-pane) {
  font-size: 1rem; /* 调整内容区域文字大小 */
}

/* 调整表格整体字体 */
:deep(.el-table) {
  font-size: 1rem;  /* 默认字体大小 */
}

/* 表头字体加粗并调大 */
:deep(.el-table th.el-table__cell) {
  font-size: 1rem;
  font-weight: bold;
}

/* 表格内容字体 */
:deep(.el-table td.el-table__cell) {
  font-size: 1rem;
}

/* 调整分页信息字体（如果表格带分页） */
:deep(.el-pagination__total),
:deep(.el-pagination__jump) {
  font-size: 1rem;
}

.upload-demo {
  width: 100%;
}

.file-info {
  margin-top: 10px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

</style>