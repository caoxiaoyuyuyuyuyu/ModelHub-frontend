<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Connection, Delete, Edit, Back } from '@element-plus/icons-vue';
import type { VectorDbForm } from '../types/vectorDb';
const route = useRoute();
const loading = ref(true);
const vectorDbId = ref<number>(parseInt(route.params.id as string));

// 数据库基本信息
const vectorDb = ref<VectorDbForm>({
  id: 0,
  name: '',
  describe: '',
  created_at: '',
  updated_at: '',
  model_configs: [],
  documents: []
});

// 获取数据库详情
const fetchVectorDbDetail = async () => {
  loading.value = true;
  try {
    // 模拟API请求 - 实际项目中替换为真实API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据 - 实际项目中删除这部分
    vectorDb.value = {
      id: vectorDbId.value,
      name: '客户知识库',
      describe: '包含所有客户信息和交互历史的向量数据库，支持快速检索客户相关数据',
      created_at: '2023-07-01',
      updated_at: '2023-09-15',
      model_configs: [
        {
          id: 1,
          name: '客户服务模型',
          description: '用于处理客户咨询的专用模型',
          share_id: 'cfg_12345',
          base_model_id: 101,
          temprature: 0.7,
          top_p: 0.9,
          prompt: '你是一个专业的客户服务助手，请用友好的方式回答客户问题。',
          vector_db_id: vectorDbId.value,
          created_at: '2023-07-10',
          updated_at: '2023-08-20',
          is_private: false
        },
        {
          id: 2,
          name: '销售分析模型',
          description: '分析客户购买行为的模型',
          share_id: 'cfg_67890',
          base_model_id: 102,
          temprature: 0.5,
          top_p: 0.8,
          prompt: '分析客户购买历史并提供销售建议。',
          vector_db_id: vectorDbId.value,
          created_at: '2023-07-15',
          updated_at: '2023-09-01',
          is_private: true
        }
      ],
      documents: [
        {
          id: 1,
          orignal_name: '客户手册.pdf',
          type: 'pdf',
          size: 2456789,
          save_path: '/documents/customer_manual.pdf',
          describe: '客户服务标准操作手册',
          upload_at: '2023-07-05'
        },
        {
          id: 2,
          orignal_name: '产品介绍.docx',
          type: 'docx',
          size: 1234567,
          save_path: '/documents/product_intro.docx',
          describe: '最新产品功能介绍文档',
          upload_at: '2023-07-12'
        }
      ]
    };
    
    loading.value = false;
  } catch (error) {
    console.error('获取数据库详情失败:', error);
    loading.value = false;
  }
};

// 删除文档
const handleDeleteDocument = (docId: number) => {
  console.log('删除文档:', docId);
  // 实际项目中调用API删除文档
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
        <h2 class="page-title">向量数据库详情</h2>
      </div>
      
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <div class="title-section">
            <el-icon class="icon">
              <Connection />
            </el-icon>
            <h3>{{ vectorDb.name }}</h3>
            <el-tag type="success" effect="plain" size="small">运行中</el-tag>
          </div>
          <div class="actions">
            <el-button type="primary" :icon="Edit" size="small">编辑</el-button>
            <el-button type="danger" :icon="Delete" size="small">删除</el-button>
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
              <el-button type="primary" size="small">添加模型配置</el-button>
            </div>
            
            <el-table :data="vectorDb.model_configs" style="width: 100%" border>
              <el-table-column prop="name" label="配置名称" width="180" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="temprature" label="Temperature" width="120" />
              <el-table-column prop="top_p" label="Top P" width="120" />
              <el-table-column prop="is_private" label="私有" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.is_private ? 'danger' : 'success'" size="small">
                    {{ row.is_private ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="updated_at" label="更新时间" width="180" />
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 存储文档标签页 -->
        <el-tab-pane label="存储文档">
          <div class="tab-content">
            <div class="action-bar">
              <el-button type="primary" size="small">上传文档</el-button>
            </div>
            
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
                  <el-button type="primary" size="small">下载</el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
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

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
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

</style>