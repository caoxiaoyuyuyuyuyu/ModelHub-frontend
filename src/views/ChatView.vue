<!-- src/views/ChatView.vue -->
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ElDrawer, ElButton, ElInput, ElIcon } from 'element-plus';
import { Fold, Expand, Promotion } from '@element-plus/icons-vue';
import type { Conversation, ChatMessage } from '../types/chat';
import { getConversations, getMessages, chat } from '../api/chat';
import { getCurrentTime } from '../utils/common';
import { getModelConfig } from '../api/model';

const route = useRoute();

// 获取路由参数
const configName = ref(route.query.config_name as string || '');
const modelConfigId = ref(route.query.model_config_id as string || '');
const conversationId = ref(route.query.conversation_id as string || '');

// 控制抽屉显示/隐藏
const drawerVisible = ref(false);
const drawerWidth = ref(400);

// 对话历史列表（模拟数据）
const chatHistory = ref<Conversation[]>([]);

// 当前对话的消息列表
const messages = ref<ChatMessage[]>([]);

// 用户输入的消息
const userInput = ref('');
const messageAreaRef = ref<HTMLElement | null>(null);

// 发送消息
const sendMessage = async () => {
  if (userInput.value.trim() === '') return;
  
  // 添加用户消息
  messages.value.push({
    content: userInput.value,
    role: 'user',
    create_at: getCurrentTime(),
  });
  
  // 滚动到底部
  scrollToBottom();
  
  // 创建请求参数
  const formData = new FormData();
  formData.append('conversation_id', conversationId.value);
  formData.append('message', userInput.value);
  formData.append('model_config_id', modelConfigId.value);

  // 清空输入框
  const userInputBack = userInput.value;

  userInput.value = '';

  const response = await chat(formData);
  if (!response) {
    userInput.value = userInputBack;
    return;
  };
  console.log('响应数据:', response);
  
  // 模拟AI回复
  messages.value.push(response);
  scrollToBottom();
  
};

// 切换抽屉显示
const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value;
};

const hanleChangeConversation = async (id: number, model_config_id: number) => { 
  // 更新当前对话ID和模型配置ID
  conversationId.value = id.toString();
  modelConfigId.value = model_config_id.toString();
  try {
    // 重置模型配置名称，确保重新加载
    configName.value = "";
    
    // 创建请求参数
    const formData = new FormData();
    formData.append('conversation_id', id.toString());
    
    // 获取新对话的消息
    const ori_messages = await getMessages(formData);
    
    // 按时间排序消息
    messages.value = ori_messages.messages.sort(
      (a: ChatMessage, b: ChatMessage) => 
        new Date(a.create_at).getTime() - new Date(b.create_at).getTime()
    );
    
    // 加载模型配置名称（如果尚未加载）
    if (!configName.value) {
      configName.value = await getModelConfig(model_config_id);
    }
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom();
    });
    
  } catch (error) {
    console.error('切换对话失败:', error);
    // 失败时显示错误信息
    messages.value = [{
      role: 'system',
      content: '对话加载失败，请重试',
      create_at: getCurrentTime(),
    }];
  }
};
const loadDate = async () => { 
  if (!configName.value){
    configName.value = await getModelConfig(Number(modelConfigId.value));
  }
  scrollToBottom();
  chatHistory.value = await getConversations();
  if (conversationId.value) {
    const formDate = new FormData();
    formDate.append('conversation_id', conversationId.value);
    const ori_messages = await getMessages(formDate);
    messages.value = ori_messages.messages.sort((a: ChatMessage, b: ChatMessage) => new Date(a.create_at).getTime() - new Date(b.create_at).getTime());
  }else{
    messages.value = [{
      role: 'system',
      content: '请开始你的对话',
      create_at: getCurrentTime(),
    }];
  }
};

// 页面加载时，根据modelConfigId加载模型配置
onMounted(async() => {
  loadDate();
});

// 滚动消息区域到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageAreaRef.value) {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
    }
  });
};

</script>

<template>
  <div class="chat-container">
    <!-- 左侧抽屉：对话历史 -->
    <ElDrawer
      v-model="drawerVisible"
      title="对话历史"
      direction="ltr"
      :with-header="true"
      :size="drawerWidth"
      :show-close="false"
    >
      <div class="history-list">
        <div 
          v-for="item in chatHistory" 
          :key="item.id" 
          class="history-item"
          :class="{ active: item.id == Number(conversationId) }"
          @click="hanleChangeConversation(item.id,item.model_config_id)"
        >
          <div class="history-title">{{ item.name }}</div>
          <div class="history-preview">{{ item.last_message }}</div>
          <div class="history-time">{{ item.create_at }}</div>
        </div>
      </div>
      <div class="new-chat-btn">
        <ElButton type="primary" size="large" plain>新建对话</ElButton>
      </div>
    </ElDrawer>

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 顶部标题栏 -->
      <div class="chat-header">
        <ElButton @click="toggleDrawer" :icon="drawerVisible ? Fold : Expand" circle class="toggle-btn" />
        <h2>{{ configName }}</h2>
        <div class="model-info">模型配置: {{ configName }}</div>
      </div>

      <!-- 消息区域 -->
      <div ref="messageAreaRef" class="message-area">
        <div 
          v-for="message in messages" 
          :key="message.create_at" 
          class="message" 
          :class="{ 'user-message': message.role=='user', 'ai-message': message.role=='assistant' }"
        >
          <div class="message-avatar">
            <img :src="'/public/vite.svg'" :alt="'头像'">
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ message.create_at }}</div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-box">
          <ElInput
            v-model="userInput"
            type="textarea"
            :rows="1"
            placeholder="请输入消息..."
            @keyup.enter.native="sendMessage"
            resize="none"
            class="message-input"
          />
          <div class="input-actions" @click="sendMessage">
            <el-icon size="25" color="#fff"><Promotion /></el-icon>
            发送
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 160px); /* 减去导航栏高度 */
  background-color: #f5f7fa;
  flex: 1;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  margin: 20px;
  overflow: hidden;
  height: calc(100% - 40px);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  border-bottom: 1px solid #ebeef5;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.chat-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
  font-weight: 600;
}

.model-info {
  margin-left: auto;
  color: #909399;
  font-size: 0.9rem;
  background-color: #f5f7fa;
  padding: 4px 10px;
  border-radius: 12px;
}

.toggle-btn {
  background-color: #f5f7fa;
  border: none;
  color: #606266;
}

.message-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: linear-gradient(135deg, #f9f9ff 0%, #f0f4ff 100%);
}

.message {
  display: flex;
  max-width: 80%;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  flex-shrink: 0;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-avatar img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.message-text {
  padding: 14px 18px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 1rem;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

.message-text::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  bottom: 0;
}

.message-time {
  font-size: 0.75rem;
  color: #909399;
  margin-top: 6px;
  padding: 0 8px;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.user-message .message-avatar {
  margin-right: 0;
  margin-left: 15px;
}

.user-message .message-content {
  align-items: flex-end;
}

.user-message .message-text {
  background: linear-gradient(135deg, #5b8cff 0%, #3a6eff 100%);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 3px 10px rgba(58, 110, 255, 0.2);
  text-align: left;
}

.user-message .message-text::after {
  right: -8px;
  background: linear-gradient(135deg, #5b8cff 0%, #3a6eff 100%);
  transform: rotate(45deg);
}

.ai-message .message-avatar {
  margin-left: 0;
  margin-right: 15px;
}

.ai-message .message-content {
  align-items: flex-start;
}

.ai-message .message-text {
  background: white;
  color: #1d1d1f;
  border-bottom-left-radius: 4px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  text-align: left;
}

.ai-message .message-text::after {
  left: -8px;
  background: white;
  transform: rotate(45deg);
}

.input-area {
  padding: 15px 25px;
  background-color: white;
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}

.input-box {
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: border-color 0.3s;
  display: flex;
}

.input-box:hover {
  border-color: #c0c4cc;
}

:deep(.message-input .el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  padding: 16px;
  font-size: 1rem;
  line-height: 1.6;
  resize: none;
}

.input-actions {
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: #409eff;
    color: #fff;
    flex-direction: row;
    align-items: center;
    width: 85px;
    font-size: 1rem;
    gap: 8px;
}

.history-list {
  padding: 0 15px;
  height: calc(100% - 70px);
  overflow-y: auto;
}

.history-item {
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d9ecff;
}

.history-item.active {
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.history-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #303133;
  font-size: 15px;
}

.history-preview {
  font-size: 0.9rem;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 0.75rem;
  color: #909399;
  margin-top: 4px;
}

.new-chat-btn {
  padding: 18px;
  border-top: 1px solid #ebeef5;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  text-align: center;
}

/* 滚动条美化 */
.message-area::-webkit-scrollbar {
  width: 8px;
}

.message-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.message-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.message-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>