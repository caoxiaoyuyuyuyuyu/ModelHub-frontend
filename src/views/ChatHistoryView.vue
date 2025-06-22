<!-- src/views/HistoryView.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Conversation } from '../types/chat';
import { onMounted } from 'vue';
import { getModelConfig, getModelInfos } from '../api/model';
import type { ModelInfo } from '../types/model_config';
import { getConversations } from '../api/chat';
import { getFormatTimeString } from '../utils/common';

const router = useRouter();

// 筛选条件
const searchQuery = ref('');
const selectedDateRange = ref('all');
const selectedModel = ref(null);
const detailVisible = ref(false);
const detailData = ref<Conversation>({
  id: 0,
  name: '',
  messages: [],
  model_config_id: 0,
  chat_history: 10,
  create_at: '',
  update_at: '',
});

// 模型列表
const models = ref<ModelInfo[]>([]);

// 历史对话数据 - 使用 HistoryItem 类型
const histories = ref<Conversation[]>([]);

// 过滤后的历史记录
const filteredHistories = computed(() => {
  const filtered = histories.value.filter(history => {
    // 搜索过滤
    const matchesSearch = searchQuery.value === '' || 
      history.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // 模型过滤
    const matchesModel = selectedModel.value === null || 
      history.model_config_id === models.value.find(m => m.id === selectedModel.value)?.id;
    
    // 日期过滤（简化处理）
    console.log(selectedDateRange.value)
    function is_match_date(date_str: string, range: string) {
      const date = new Date(date_str);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return days < parseInt(range);
    }
    const matchesDate = selectedDateRange.value === 'all' || is_match_date(history.update_at, selectedDateRange.value);
    
    return matchesSearch && matchesModel && matchesDate;
  });
  return filtered.sort((a, b) => new Date(b.update_at).getTime() - new Date(a.update_at).getTime());
});
const modelName = ref('');
// 显示详情弹窗
const showDetail = async (history: Conversation) => {
  detailData.value = history;
  detailVisible.value = true;
  const model_config = await getModelConfig(history.model_config_id)
  modelName.value = model_config.name;
};

// 继续对话
const continueChat = async (history: Conversation) => {
  const model_config = await getModelConfig(history.model_config_id)
  modelName.value = model_config.name;
  router.push({
    path: '/chat',
    query: {
      conversation_id: history.id,
      config_name: modelName.value,
      model_config_id: history.model_config_id
    }
  });
};

onMounted(async() => { 
  models.value = await getModelInfos();
  histories.value = await getConversations();
  
  // 修复：遍历每个对话历史，对其消息数组排序
  histories.value.forEach(history => {
    history.messages.sort((a, b) => {
      return new Date(a.create_at).getTime() - new Date(b.create_at).getTime();
    });
  });
  
  console.log('sorted histories', histories.value);
});

</script>

<template>
  <div class="page-container"> 
    <div class="history-container">
        <h2>对话历史</h2>
        <p class="subtitle">查看和管理您的历史对话记录</p>

        <!-- 筛选区域 -->
        <div class="filter-section">
        <!-- <div class="filter-group">
            <el-input
            v-model="searchQuery"
            placeholder="搜索对话历史..."
            clearable
            class="search-input"
            >
            <template #prefix>
                <el-icon><search /></el-icon>
            </template>
            </el-input>
        </div> -->
        
        <div class="filter-group">
            <el-select v-model="selectedDateRange" placeholder="时间范围" clearable>
            <el-option label="今天" value="0"></el-option>
            <el-option label="最近7天" value="7"></el-option>
            <el-option label="最近30天" value="30"></el-option>
            <el-option label="全部" value="all"></el-option>
            </el-select>
        </div>
        
        <!-- <div class="filter-group">
            <el-select v-model="selectedModel" placeholder="模型筛选" clearable>
            <el-option 
                v-for="model in models" 
                :key="model.id" 
                :label="model.model_name" 
                :value="model.id"
            ></el-option>
            </el-select>
        </div> -->
        </div>

        <!-- 历史对话卡片 -->
        <div class="history-list">
        <div 
            v-for="(history, index) in filteredHistories" 
            :key="index" 
            class="history-card"
        >
            <div class="card-header" >
            <h4>{{ history.name }}</h4>
            
            <span class="card-date"><el-icon><clock /></el-icon>{{ getFormatTimeString(history.update_at) }}</span>
            </div>
            <div class="card-footer">
            <div class="message-count">
                <el-icon><chat-dot-round /></el-icon>
                {{ history.messages.length>=10?'10+' : history.messages.length }} 条消息
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
        :title="detailData.name" 
        width="60%" 
        custom-class="history-detail-dialog"
        >
        <div class="detail-header">
            <!-- <div class="detail-title">{{ detailData.name }}</div>/ -->
            <div class="detail-meta">
            <div class="meta-item">
                <el-icon><clock /></el-icon>
                <span>{{ getFormatTimeString(detailData.update_at) }}</span>
            </div>
            <div class="meta-item">
                <!-- <el-icon><cpu /></el-icon> -->
                <span>{{ models.find((item)=>{return item.id===detailData.model_config_id})?.model_name }}</span>
            </div>
            <div class="meta-item">
                <el-icon><chat-dot-round /></el-icon>
                <span>{{ detailData.messages.length>=10?'10+':detailData.messages.length }} 条消息</span>
            </div>
            </div>
            <div class="detail-content"> 
                <div 
                v-for="message in detailData.messages" 
                :key="message.create_at" 
                class="message" 
                :class="{ 'user-message': message.role==='user', 'ai-message': message.role==='assistant' }"
                >{{ message.content.slice(0,50) }}</div>
            </div>
        </div>
        <template #footer>
          <div class="footer-section">
            <span class="model-name" >{{ modelName }}</span>
            <div>
            <el-button @click="detailVisible = false">关闭</el-button>
            <el-button type="primary" @click="continueChat(detailData)">继续对话</el-button>
            </div>
          </div>
        </template>
        </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.history-container { 
  flex: 1;
  padding-bottom: 4rem;
}
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
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  /* background: white; */
  width: 25%;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.filter-group {
  /* flex: 1; */
  /* min-width: 250px; */
  width: 100%;
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

.card-header { 
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.card-date {
  color: #9b9b9b;
  padding-right: 1rem;
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
  justify-content: space-between;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #5a5e7d;
  font-size: 0.95rem;
  text-align: right;
}

.meta-item i {
  margin-right: 8px;
  font-size: 1.1rem;
}

.detail-content { 
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.message { 
  padding: 15px;
  border-radius: 16px;
  background: #fafafa;
  font-size: 0.95rem;
  white-space: pre-wrap;
}

.user-message { 
  background: #f0f0f0;
  text-align: end;
}
.ai-message { 
  background: #fafafa;
  text-align: start;
}
.message:last-child { 
  margin-bottom: 0;
}

.message:not(:last-child) { 
  animation: fadeIn 0.5s ease-in-out;
}

.footer-section { 
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.model-name {
  font-size: 0.8rem;
  color: #666;
  text-align: left;
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