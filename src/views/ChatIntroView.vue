<!-- src/views/ChatView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElInput, ElIcon, ElMessage } from 'element-plus';
import { Promotion } from '@element-plus/icons-vue';
import { getModelConfig } from '../api/model';
import { useUserStore } from '../stores/user';
import { getCurrentStatus } from '../utils/common';
import { chat } from '../api/chat';
import { getFineTunedModelConfig } from '../api/fintuning';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 获取路由参数
const configName = ref(route.query.config_name as string || '');
const modelConfigId = ref(route.query.model_config_id as string || '');
const model_type = ref(route.query.model_type as string || 'api');
const currentTime = ref('');


// 用户输入的消息
const userInput = ref('');
const hasInput = computed(() => userInput.value.trim() !== '');
const isLoading = ref(false); // 添加加载状态

// 发送消息
const sendMessage = async () => {
  if (!hasInput.value || isLoading.value) return;
    
  const content = userInput.value.trim();
  isLoading.value = true; // 开始加载
  
  try {
    const formData = new FormData();
    formData.append('message', content);
    formData.append('model_config_id', modelConfigId.value);
    formData.append('model_type', model_type.value);
    // 调用发送消息API
    console.log('model_type.value:', model_type.value);
    const response = await chat(formData);
    if (response ){
      if(model_type.value === 'finetuned'){
        console.log('响应数据:', response);
        router.push({
          path: '/chatBase',
          query: {
            model_config_id: modelConfigId.value,
            model_type: model_type.value,
            history: JSON.stringify([
              {
                content: content,
                role: 'user'
              },
              {
                content: response.content,
                role: 'assistant'
              }
            ])
          }
        })
        return;
      }
      else if (model_type.value != 'api')  {
      console.log('响应数据:', response);
       router.push({
          path: '/chatBase',
          query: {
            model_config_id: modelConfigId.value,
            model_type: model_type.value,
            history: JSON.stringify([
              {
                content: content,
                role: 'user'
              },
              {
                content: response.content,
                role: 'assistant'
              }
            ])
          }
        })
        return;
      }
    }else{
      return;
    }
    
    // 成功获取会话ID后跳转到聊天页面
    if (response.conversation_id) {
      router.push({
        path: '/chat',
        query: { 
          conversation_id: response.conversation_id,
          config_name: configName.value,
          model_config_id: modelConfigId.value,
          model_type: model_type.value
        }
      });
    } else {
      // throw new Error('未获取到会话ID');
    }
  } catch (error) {
    // 处理错误情况
    console.error(error);
    ElMessage.error('消息发送失败，请重试');
    isLoading.value = false; // 重置加载状态
  }
};


const loadDate = async () => { 
  if (!configName.value){
    if(model_type.value == 'api'){
      const response = await getModelConfig(Number(modelConfigId.value));
      configName.value = response.name;
    }
    else if(model_type.value == 'finetuned'){
      const response = await getFineTunedModelConfig(Number(modelConfigId.value))
      configName.value = response.name;
    }
  }
  // 上午还是下午还是晚上
  currentTime.value = getCurrentStatus();
  console.log(currentTime.value);
};

// 页面加载时，根据modelConfigId加载模型配置
onMounted(async() => {
  loadDate();
});

</script>

<template>
  <div class="chat-container">
      <!-- 欢迎区域 -->
      <div>
        <h1>{{ currentTime }}好，{{ userStore.user?.name }}</h1>
        <h4 class="subtitle">欢迎使用{{ configName }}</h4>
        <p v-if="isLoading">请稍后。。。</p>
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
            @keydown.enter.native.prevent="sendMessage"
            resize="none"
            class="message-input"
          />
          <div class="input-actions" @click="sendMessage"
          :style="{
            background: !isLoading && hasInput
              ? 'linear-gradient(135deg, #5b8cff 0%, #3a6eff 100%)' 
              : '#c0c4cc'
          }">
            <el-icon size="25" color="#fff"><Promotion /></el-icon>
          </div>
        </div>
      </div>
    
  </div>
</template>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    height: calc(100vh - 500px); 
}

.input-area {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1170px; /* 限制最大宽度 */
  padding: 0 20px; /* 添加左右内边距 */
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
</style>