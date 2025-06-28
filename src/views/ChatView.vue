<!-- src/views/ChatView.vue -->
<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElDrawer, ElButton, ElInput, ElIcon } from 'element-plus';
import { Fold, Expand, Promotion } from '@element-plus/icons-vue';
import type { Conversation, ChatMessage } from '../types/chat';
import { getConversations, getMessages, chat, rechat, setChatHistory } from '../api/chat';
import { getCurrentTime } from '../utils/common';
import { getModelConfig } from '../api/model';
import { Refresh } from '@element-plus/icons-vue';

// 引入Markdown解析库和代码高亮库
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 创建自定义渲染器以支持代码高亮
const renderer = new marked.Renderer();

// 重写代码块渲染方法

renderer.code = ({ text, lang }) => {
  const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.highlight(text, { language: validLang }).value;
  return `<pre><code class="hljs ${validLang}">${highlighted}</code></pre>`;
};

// 配置marked
marked.setOptions({
  renderer,
  breaks: true,
  gfm: true
});
const route = useRoute();
const router = useRouter();

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
const hasInput = computed(() => userInput.value.trim() !== '');
const messageAreaRef = ref<HTMLElement | null>(null);
// 发送消息
const sendMessage = async (query: string) => {
  query = query.trim() || userInput.value;
  if (query.trim() === '') return;
  // 添加用户消息
  messages.value.push({
    content: query,
    role: 'user',
    create_at: getCurrentTime(),
  });
  messages.value.push({
    content: '正在思考。。。',
    role: 'assistant',
    create_at: getCurrentTime(),
  });

  // 滚动到底部
  scrollToBottom();
  
  // 创建请求参数
  const formData = new FormData();
  formData.append('conversation_id', conversationId.value);
  formData.append('message', query);
  formData.append('model_config_id', modelConfigId.value);

  // 清空输入框
  // const userInputBack = query;

  userInput.value = '';

  try{
    const response = await chat(formData);
    console.log('response', response);
    messages.value.pop()
    console.log('响应数据:', response);
    
    // 模拟AI回复
    messages.value.push(response);
    scrollToBottom();
  }catch(error){
    console.log('error', error);
    // userInput.value = userInputBack;
    messages.value.pop()
    messages.value.push({
      content: '请求失败，请稍后再试',
      role: 'assistant',
      create_at: getCurrentTime(),
    });
    return;
  }
  
};
const handleRegenerate = async (index: number) => {
  const reg_content = messages.value[index].content;
  // console.log('reg_content:', reg_content);
  if (reg_content === '正在思考。。。') {
    console.log('正在思考。。。');
    return;
  }
  if (reg_content === '请求失败，请稍后再试') {
    console.log('请求失败，请稍后再试');
    messages.value.pop()
    const last_query = messages.value[index - 1].content;
    messages.value.pop()
    console.log('last_query:', last_query);
    await sendMessage(last_query);
    return;
  }
  const formData = new FormData();
  formData.append('conversation_id', conversationId.value);
  try {
    const response = await rechat(formData);
    console.log('响应数据:', response);
  }catch (error) {
    console.error('请求失败:', error);
  }
};

const renderMarkdown = (content: string) => {
  return marked.parse(content);
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
    const conversaton = (await getMessages(formData));
    ConversationInfo.value = conversaton.conversation_info;
    const ori_messages = conversaton.history;

    
    // 按时间排序消息
    messages.value = ori_messages.messages.sort(
      (a: ChatMessage, b: ChatMessage) => 
        new Date(a.create_at).getTime() - new Date(b.create_at).getTime()
    );
    
    // 加载模型配置名称（如果尚未加载）
    if (!configName.value) {
      configName.value = (await getModelConfig(model_config_id)).name;
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
const hanleNewConversation = async () => {
  router.push({
    path: '/intro',
    query: {
      config_name: configName.value,
      model_config_id: modelConfigId.value
    }
  });
};

const ConversationInfo = ref<Conversation>({
  id: 0,
  name: '',
  model_config_id: 0,
  messages: [],
  chat_history: 10,
  create_at: '',
  update_at: ''
});
const loadDate = async () => { 
  if (!configName.value){
    configName.value = await getModelConfig(Number(modelConfigId.value));
  }
  scrollToBottom();
  chatHistory.value = await getConversations();
  if (conversationId.value) {
    const formData = new FormData();
    formData.append('conversation_id', conversationId.value);
    const conversaton = (await getMessages(formData));
    ConversationInfo.value = conversaton.conversation_info;
    const ori_messages = conversaton.history;
    messages.value = ori_messages.messages.sort((a: ChatMessage, b: ChatMessage) => new Date(a.create_at).getTime() - new Date(b.create_at).getTime());
  }else{
    messages.value = [{
      role: 'system',
      content: '请开始你的对话',
      create_at: getCurrentTime(),
    }];
  }
};
const handleChatHistoryChange = (e: any) => { 
  setChatHistory( conversationId.value,e.target.value).then(() => {
    ConversationInfo.value.chat_history = e.target.value;
  });
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
  <div class="chat-header">
    <ElButton @click="toggleDrawer" size="large" :icon="drawerVisible ? Fold : Expand" circle class="toggle-btn" />
    <h4>{{ ConversationInfo?.name }}</h4>
    <div class="model-info">{{ configName }} 提供服务</div>
  </div>
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
        <ElButton type="primary" size="large" plain @click="hanleNewConversation()">新建对话</ElButton>
      </div>
    </ElDrawer>
    <!-- 主聊天区域 -->
    <div class="chat-main">

      <!-- 消息区域 -->
      <div ref="messageAreaRef" class="message-area">
        <div 
          v-for="(message,index) in messages" 
          :key="message.create_at" 
          class="message" 
          :class="{ 'user-message': message.role=='user', 'ai-message': message.role=='assistant' }"
        >
          <div class="message-avatar">
            <img :src="'/public/vite.svg'" :alt="'头像'">
          </div>
          <div class="message-content">
            <div 
              class="message-text markdown-body" 
              v-html="renderMarkdown(message.content)"
            ></div>
            <!-- <div class="message-text">{{ message.content }}</div> -->
            <div class="message-time">{{ message.create_at }}</div>
          <!-- 添加重新生成按钮 -->
          <div class="regenerate-action" v-if="message.role === 'assistant'">
            <el-tooltip content="重新生成回复" placement="top">
              <el-icon class="regenerate-icon" @click="handleRegenerate(index)">
                <Refresh />
              </el-icon>
            </el-tooltip>
          </div>
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
            :autosize="{ minRows: 1, maxRows: 4}"
            placeholder="请输入消息..."
            @keydown.enter.native.prevent="sendMessage(userInput)"
            resize="none"
            class="message-input"
          />
          <div class="input-info-box">
            <div class="context-length-container">
              <label>上下文参考长度：</label>
              <input
                type="number"
                @change="handleChatHistoryChange"
                v-model="ConversationInfo.chat_history"
                :min="1"
                :max="10"
                class="context-length-input"
                step="1"
                style="appearance: auto;"
              />
            </div>
            <div class="input-actions" @click="sendMessage(userInput)"
            :style="{
              background: hasInput 
                ? 'linear-gradient(135deg, #5b8cff 0%, #3a6eff 100%)' 
                : '#c0c4cc'
            }">
              <el-icon size="25" color="#fff"><Promotion /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  /* height: calc(100vh - 160px);  */
  /* background-color: #f5f7fa; */
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  justify-content: space-between;
  overflow: hidden;
  /* height: 100vh; 确保容器占满整个视口高度 */
  height: calc(100vh - 170px); 
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  border-bottom: 1px solid #ebeef5;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  flex-direction: column;
  width: 60px; /* 固定宽度 */
  left: 0;
  height: calc(100vh - 195px); 
  position: fixed;
}

.chat-header h4 {
  writing-mode: vertical-lr;
  text-orientation: mixed; /* 保持文字方向 */
  margin: 0 5px; /* 根据需要调整间距 */
  letter-spacing: 2px; /* 可选的字母间距 */
}

.model-info {
  margin-left: auto;
  color: #909399;
  font-size: 0.9rem;
  padding: 4px 10px;
  border-radius: 12px;
  flex-grow: 1;
  writing-mode: vertical-lr;
  text-orientation: mixed; /* 保持文字方向 */
  text-align: end;
  letter-spacing: 2px; /* 可选的字母间距 */
}

.toggle-btn {
  background-color: #f5f7fa;
  border: none;
  color: #606266;
}

.message-area {
  flex-grow: 1; /* 填充剩余空间 */
  overflow-y: auto;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1170px;
  margin: 0 auto; /* 水平居中 */
  width: 100%; /* 确保宽度填充 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE/Edge 隐藏滚动条 */
  /* background: linear-gradient(135deg, #f9f9ff 0%, #f0f4ff 100%); */
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

/* .message-text::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  bottom: 0;
} */

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
  margin-right: 20px;
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
/* 重新生成按钮样式 */
.regenerate-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.message:hover .regenerate-action {
  opacity: 1;
}

.regenerate-icon {
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  background-color: #f5f7fa;
  color: #606266;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.regenerate-icon:hover {
  background-color: #e6e9ed;
  transform: rotate(30deg);
  color: #3a6eff;
}
.user-message .regenerate-action {
  display: none; /* 用户消息不显示重新生成按钮 */
}
/* .input-area {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  padding: 1px 25px;
  z-index: 10;
  display: flex;
  justify-content: center;
} */
.input-area {
  position: sticky; /* 改为 sticky 定位 */
  bottom: 0;
  /* padding-bottom: 20px; */
  /* background-color: #fff;  */
  z-index: 10;
  display: flex;
  justify-content: center;
  /* border-top: 1px solid #ebeef5; 可选：添加顶部边框 */
}
.input-box {
  display: flex;
  align-items: flex-end;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e3e8;
  transition: all 0.3s ease;
  overflow: hidden;
  max-width: 1170px; /* 与消息区域一致 */
  width: 100%; /* 确保宽度填充 */
  flex-direction: column;
  flex-wrap: nowrap;
}

.input-box:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #c2c8d1;
}

/* 输入框样式 */
:deep(.message-input .el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  padding: 16px 20px;
  font-size: 1.2rem;
  line-height: 1.5;
  resize: none;
  background: transparent;
  min-height: 56px;
  max-height: 200px; /* 设置最大高度 */
  height: auto; /* 允许高度自动调整 */
  overflow-y: auto; /* 内容过多时显示滚动条 */
  color: #1d1d1f;
}

:deep(.message-input .el-textarea__inner::placeholder) {
  color: #a8a8a8;
  font-weight: 400;
}

.input-info-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  flex-wrap: nowrap;
  flex: 1;
  width: 100%; 
}

.input-info-box >span { 
  color: #a8a8a8;
  margin-left: 1rem;
}

/* 发送按钮区域 */
.input-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 8px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #5b8cff 0%, #3a6eff 100%);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.input-actions:hover {
  background: linear-gradient(135deg, #4a7dff 0%, #2a5eff 100%);
  transform: translateY(-1px);
}

.input-actions:active {
  transform: translateY(0);
}

/* 发送图标和文字 */
.send-icon {
  font-size: 20px;
  color: white;
  margin-right: 6px;
  transition: transform 0.2s ease;
}

.send-text {
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
}

.input-actions:hover .send-icon {
  transform: translateX(2px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .input-actions {
    width: 60px;
    height: 44px;
  }
  
  :deep(.message-input .el-textarea__inner) {
    padding: 14px 16px;
  }
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

/* 添加Markdown渲染样式 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.markdown-body :deep(h1) {
  padding-bottom: 0.3em;
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(h2) {
  padding-bottom: 0.3em;
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(h3) {
  font-size: 1.25em;
}

.markdown-body :deep(h4) {
  font-size: 1em;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
}

.markdown-body :deep(pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin: 16px 0;
}

.markdown-body :deep(pre code) {
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  background: transparent;
  border: 0;
  display: inline;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-body :deep(ul, ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(li) {
  margin-bottom: 0.25em;
}

.markdown-body :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: 100%;
  overflow: auto;
  margin: 16px 0;
}

.markdown-body :deep(th) {
  font-weight: 600;
}

.markdown-body :deep(th, td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body :deep(tr) {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-body :deep(tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

/* 调整AI消息的Markdown样式 */
.ai-message .message-text :deep(pre) {
  background-color: #f0f4ff;
}

.ai-message .message-text :deep(code) {
  background-color: rgba(58, 110, 255, 0.08);
}

/* 调整用户消息的Markdown样式 */
.user-message .message-text :deep(pre) {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-message .message-text :deep(code) {
  background-color: rgba(255, 255, 255, 0.15);
}

/* 确保Markdown内容中的图片不会过大 */
.markdown-body :deep(img) {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
}

.context-length-container {
  display: flex;
  align-items: center;
  margin-left: 1rem;
  color: #cacaca;
}

.context-length-input {
  width: 40px;
  text-align: center;
  color: #cacaca;
  border: none;
  font-size: 1rem;
}

.number-input {
  display: flex;
  align-items: center;
}

.spin-button {
  width: 25px;
  height: 25px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  margin: 0 2px;
  cursor: pointer;
}
</style>