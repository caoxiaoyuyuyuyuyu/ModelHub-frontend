<!-- src/views/ChatView.vue -->
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ElDrawer, ElButton, ElInput, ElIcon } from 'element-plus';
import { Fold, Expand, Promotion } from '@element-plus/icons-vue';

const route = useRoute();

// 获取路由参数
const configName = ref(route.query.config_name as string || '');
const modelConfigId = ref(route.query.model_config_id as string || '');

// 控制抽屉显示/隐藏
const drawerVisible = ref(false);
const drawerWidth = ref(400);

// 对话历史列表（模拟数据）
const chatHistory = ref([
  { id: 1, title: '关于图像分类的问题', lastMessage: '这个模型可以识别哪些类别？', timestamp: '2023-04-10 14:30' },
  { id: 2, title: '模型性能讨论', lastMessage: '准确率能达到多少？', timestamp: '2023-04-09 10:15' },
  { id: 3, title: '部署问题', lastMessage: '如何部署到生产环境？', timestamp: '2023-04-08 16:45' },
]);

// 当前对话的消息列表
const messages = ref([
  { 
    id: 1, 
    content: '你好！我是AI助手，有什么可以帮您？', 
    isUser: false, 
    timestamp: new Date(),
    avatar: '/public/vite.svg'
  },
]);

// 用户输入的消息
const userInput = ref('');
const messageAreaRef = ref<HTMLElement | null>(null);

// 发送消息
const sendMessage = () => {
  if (userInput.value.trim() === '') return;
  
  // 添加用户消息
  messages.value.push({
    id: messages.value.length + 1,
    content: userInput.value,
    isUser: true,
    timestamp: new Date(),
    avatar: '/public/image.png'
  });
  
  // 滚动到底部
  scrollToBottom();
  
  // 模拟AI回复
  setTimeout(() => {
    messages.value.push({
      id: messages.value.length + 1,
      content: '这是AI的回复。模型配置ID：' + modelConfigId.value + '，配置名称：' + configName.value,
      isUser: false,
      timestamp: new Date(),
      avatar: '/public/vite.svg'
    });
    scrollToBottom();
  }, 500);
  
  // 清空输入框
  userInput.value = '';
};

// 切换抽屉显示
const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value;
};

// 页面加载时，根据modelConfigId加载模型配置
onMounted(() => {
  console.log('模型配置ID:', modelConfigId.value);
  console.log('配置名称:', configName.value);
  scrollToBottom();
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
          :class="{ active: item.id === 1 }"
        >
          <div class="history-title">{{ item.title }}</div>
          <div class="history-preview">{{ item.lastMessage }}</div>
          <div class="history-time">{{ item.timestamp }}</div>
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
        <div class="model-info">模型配置ID: {{ modelConfigId }}</div>
      </div>

      <!-- 消息区域 -->
      <div ref="messageAreaRef" class="message-area">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="message" 
          :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
        >
          <div class="message-avatar">
            <img :src="message.avatar" :alt="message.isUser ? '用户头像' : 'AI头像'">
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</div>
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
}

.user-message .message-text::after {
  right: -8px;
  background: linear-gradient(135deg, #5b8cff 0%, #3a6eff 100%);
  transform: rotate(45deg);
}

.ai-message .message-text {
  background: white;
  color: #1d1d1f;
  border-bottom-left-radius: 4px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
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