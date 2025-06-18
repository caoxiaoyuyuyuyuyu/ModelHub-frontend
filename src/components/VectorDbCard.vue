<script setup lang="ts">
import { Connection } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { testConnect } from '../api/vectorDb';
import { ElMessage } from 'element-plus';


interface VectorDbCardProps {
  created_at: string;
  describe: string;
  id: number;
  name: string;
  updated_at: string;
}
const router = useRouter();
const navigateToDetail = (id: number) => {
  router.push(`/database/${id}`);
};

const HandletestConnect = async (id: number) => { 
  const res = await testConnect(id)
  if (res) {
    ElMessage.success('连接成功');
  } else {
    ElMessage.error('连接失败');
  }

};

defineProps<VectorDbCardProps>();
</script>

<template>
  <div class="vector-db-card">
    <div class="card-header">
      <div class="card-title">
        <el-icon class="icon">
          <Connection />
        </el-icon>
        <h3>{{ name }}</h3>
      </div>
    </div>
    
    <div class="card-content">
      <p class="description">{{ describe }}</p>
      <!-- <div class="metadata"> -->
        <!-- <div class="meta-item">
          <span class="meta-label">ID:</span>
          <span class="meta-value">{{ id }}</span>
        </div> -->
        <!-- <div class="meta-item">
          <span class="meta-label">创建时间:</span>
          <span class="meta-value">{{ created_at }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">更新时间:</span>
          <span class="meta-value">{{ updated_at }}</span>
        </div> -->
      <!-- </div> -->
    </div>
    
    <div class="card-footer">
        <div class="meta-item">
          <span class="meta-label">创建时间:</span>
          <span class="meta-value">{{ created_at }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">更新时间:</span>
          <span class="meta-value">{{ updated_at }}</span>
        </div>
      <el-button type="primary" plain @click="navigateToDetail(id)">查看详情</el-button>
      <el-button type="success" plain @click="HandletestConnect(id)">连接测试</el-button>
      <el-button plain @click="navigateToDetail(id)">管理数据</el-button>
    </div>
  </div>
</template>

<style scoped>
.vector-db-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
  background: radial-gradient(26% 84% at 4% 4%, rgba(216, 219, 231, 0.2) 0%, rgba(232, 236, 242, 0) 94%), #fff;
}

.vector-db-card:hover {
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

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #303133;
  font-weight: 500;
}

.icon {
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 50%;
  padding: 8px;
  font-size: 1.5rem;
}
.card-content {
  margin-bottom: 1.5rem;
}

.description {
  color: #606266;
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: left;
}

.metadata {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.meta-item {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: flex-end;
}

.meta-label {
  font-size: 0.85rem;
  color: #909399;
  /* margin-bottom: 0.25rem; */
}

.meta-value {
  font-size: 0.85rem;
  color: #909399;
  /* margin-bottom: 0.25rem; */
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>