<!-- src/views/HistoryView.vue -->
<template>
  <div class="page-container"> 
    <div class="history-container">
        <h2>对话历史</h2>
        <p class="subtitle">查看和管理您的历史对话记录</p>

        <!-- 筛选区域 -->
        <div class="filter-section">
        <div class="filter-group">
            <el-input
            v-model="searchQuery"
            placeholder="搜索对话历史..."
            clearable
            class="search-input"
            >
            <template #prefix>
                <i class="el-icon-search"></i>
            </template>
            </el-input>
        </div>
        
        <div class="filter-group">
            <el-select v-model="selectedDateRange" placeholder="时间范围" clearable>
            <el-option label="今天" value="today"></el-option>
            <el-option label="最近7天" value="7days"></el-option>
            <el-option label="最近30天" value="30days"></el-option>
            <el-option label="全部" value="all"></el-option>
            </el-select>
        </div>
        
        <div class="filter-group">
            <el-select v-model="selectedModel" placeholder="模型筛选" clearable>
            <el-option 
                v-for="model in models" 
                :key="model.id" 
                :label="model.name" 
                :value="model.id"
            ></el-option>
            </el-select>
        </div>
        </div>

        <!-- 历史对话卡片 -->
        <div class="history-list">
        <div 
            v-for="(history, index) in filteredHistories" 
            :key="index" 
            class="history-card"
        >
            <h4>{{ history.title }}</h4>
            
            <div class="card-footer">
            <div class="message-count">
                <i class="el-icon-chat-dot-round"></i>
                {{ history.total }} 条消息
            </div>
            <div class="card-actions">
                <el-button 
                type="info" 
                size="small" 
                plain 
                @click="showDetail(history)"
                >
                详情
                </el-button>
                <el-button 
                type="primary" 
                size="small" 
                @click="continueChat(history)"
                >
                继续对话
                </el-button>
            </div>
            </div>
        </div>
        </div>

        <!-- 详情弹窗 -->
        <el-dialog 
        v-model="detailVisible" 
        title="对话详情" 
        width="60%" 
        custom-class="history-detail-dialog"
        >
        <div class="detail-header">
            <div class="detail-title">{{ detailData.title }}</div>
            <div class="detail-meta">
            <div class="meta-item">
                <i class="el-icon-time"></i>
                <span>{{ detailData.date }}</span>
            </div>
            <div class="meta-item">
                <i class="el-icon-cpu"></i>
                <span>{{ detailData.modelName }}</span>
            </div>
            <div class="meta-item">
                <i class="el-icon-chat-dot-round"></i>
                <span>{{ detailData.total }} 条消息</span>
            </div>
            </div>
        </div>
        <template #footer>
            <el-button @click="detailVisible = false">关闭</el-button>
            <el-button type="primary" @click="continueChat(detailData)">继续对话</el-button>
        </template>
        </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 定义历史记录类型
interface HistoryItem {
  id: string;
  title: string;
  date: string;
  modelName: string;
  total: number;
}

// 筛选条件
const searchQuery = ref('');
const selectedDateRange = ref('all');
const selectedModel = ref('');
const detailVisible = ref(false);
const detailData = ref<HistoryItem>({
  id: '',
  title: '',
  date: '',
  modelName: '',
  total: 0
});

// 模型列表
const models = ref([
  { id: 'resnet50', name: 'ResNet50图像分类模型' },
  { id: 'gpt4', name: 'GPT-4语言模型' },
  { id: 'yolo', name: 'YOLOv5目标检测' },
  { id: 'bert', name: 'BERT文本分类' }
]);

// 历史对话数据 - 使用 HistoryItem 类型
const histories = ref<HistoryItem[]>([
  {
    id: 'hist1',
    title: '图像分类模型应用讨论',
    date: '2023-06-15 14:30',
    modelName: 'ResNet50图像分类模型',
    total: 10,
  },
  {
    id: 'hist2',
    title: '图像分类模型应用讨论',
    date: '2023-06-15 14:30',
    modelName: 'ResNet50图像分类模型',
    total: 10,
  },
  {
    id: 'hist3',
    title: '图像分类模型应用讨论',
    date: '2023-06-15 14:30',
    modelName: 'ResNet50图像分类模型',
    total: 10,
  },
  // 其他历史记录...
]);

// 过滤后的历史记录
const filteredHistories = computed(() => {
  return histories.value.filter(history => {
    // 搜索过滤
    const matchesSearch = searchQuery.value === '' || 
      history.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      history.modelName.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // 模型过滤
    const matchesModel = selectedModel.value === '' || 
      history.modelName === models.value.find(m => m.id === selectedModel.value)?.name;
    
    // 日期过滤（简化处理）
    const matchesDate = selectedDateRange.value === 'all' || true;
    
    return matchesSearch && matchesModel && matchesDate;
  });
});

// 显示详情弹窗
const showDetail = (history: HistoryItem) => {
  detailData.value = history;
  detailVisible.value = true;
};

// 继续对话
const continueChat = (history: HistoryItem) => {
  router.push({
    path: '/chat',
    query: {
      config_name: history.modelName,
      history_id: history.id
    }
  });
};
</script>

<style scoped>
.history-header {
  text-align: center;
  margin-bottom: 40px;
}

.history-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1d2b;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #3a6eff 0%, #5b8cff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.filter-group {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
}

.history-list {
    display: flex;
    gap: 25px;
    margin-top: 20px;
    flex-direction: column;
}

.history-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.history-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.history-card h4 {
  color: #4d4d4d;
  text-align: left;
  padding: 0 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 22px;
  border-top: 1px solid #f0f2f7;
  background-color: #fafbff;
}

.message-count {
  display: flex;
  align-items: center;
  color: #9095b4;
  font-size: 0.9rem;
}

.message-count i {
  margin-right: 6px;
  font-size: 1rem;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.detail-header {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1d2b;
  margin-bottom: 15px;
}

.detail-meta {
  display: flex;
  gap: 25px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #5a5e7d;
  font-size: 0.95rem;
}

.meta-item i {
  margin-right: 8px;
  font-size: 1.1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 900px) {
  .history-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 600px) {
  .filter-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .history-list {
    grid-template-columns: 1fr;
  }
  
  .detail-meta {
    flex-direction: column;
    gap: 10px;
  }
}
</style>