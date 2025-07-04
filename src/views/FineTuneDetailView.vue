<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Download, ArrowLeft, Cpu, ChatDotRound, View } from '@element-plus/icons-vue';
import type { BaseModel, FineTuneRecord, FineTunedModel, FineTuneDocument } from '../types/model';
import { fetchFineTunedModelById, getFineTuneLogs, downLoadLogs } from '../api/fintuning';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

const route = useRoute();
const router = useRouter();
const modelId = ref(route.params.id as string);
const fineTunedRecord = ref<FineTuneRecord | null>(null);
const baseModel = ref<BaseModel | null>(null);
const fineTunedModel = ref<FineTunedModel | null>(null);
const fineTuneDocument = ref<FineTuneDocument | null>(null);
const trainingLogs = ref<any[]>([]);
const showLogChart = ref(false);
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const loading = ref(false);

const loadModelDetails = async () => {
  loading.value = true;
  try {
    fineTunedRecord.value = await fetchFineTunedModelById(Number(modelId.value));
    if (fineTunedRecord.value) {
        baseModel.value = fineTunedRecord.value.base_model;
        fineTunedModel.value = fineTunedRecord.value.fine_tuned_model;
        fineTuneDocument.value = fineTunedRecord.value.fine_tune_document;
    }
  } catch (error) {
    ElMessage.error('加载模型详情失败');
    console.error('Error loading model details:', error);
  } finally {
    loading.value = false;
  }
};

const handleDownloadLogs = async () => {
  try {
    // 使用 API 实例发起下载请求
    const response = await downLoadLogs(Number(modelId.value));

    // 创建临时 URL
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // 创建隐藏的下载链接
    const link = document.createElement('a');
    link.href = url;
    
    // 从响应头获取文件名
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'document';

    if (contentDisposition) {
      console.log('contentDisposition', contentDisposition);
      
      // 正确解析 RFC 5987 标准的文件名
      const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^"]+)"?/i);
      
      if (fileNameMatch && fileNameMatch[1]) {
        // 处理可能的编码格式
        let extractedName = fileNameMatch[1];
        
        // 如果是以 UTF-8'' 开头，解码后面的部分
        if (extractedName.startsWith("UTF-8''")) {
          extractedName = extractedName.substring(7);
        }
        
        // 尝试解码 URI 组件
        try {
          fileName = decodeURIComponent(extractedName);
        } catch (e) {
          console.error('文件名解码失败，使用原始值', e);
          fileName = extractedName;
        }
      } else {
        // 尝试旧式 filename="..." 格式
        const fallbackMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (fallbackMatch && fallbackMatch[1]) {
          fileName = fallbackMatch[1];
        }
      }
    }

    // 现在 fileName 应该包含正确的文件名，例如 "张三.txt"
    console.log('解析后的文件名:', fileName);
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    
    // 清理资源
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('下载文档失败:', error);
    ElMessage.error('下载文档失败');
  }
};
// View training logs
const handleViewLogs = async () => {
  try {
    const result = await getFineTuneLogs(Number(modelId.value));
    trainingLogs.value = result;
    showLogChart.value = true;
    
    // Render chart after DOM update
    nextTick(() => {
      if (chartRef.value) {
        renderChart();
      }
    });
  } catch (error) {
    ElMessage.error('获取训练日志失败');
    console.error('Error fetching training logs:', error);
  }
};

// Render ECharts
const renderChart = () => {
  if (!chartRef.value || trainingLogs.value.length === 0) return;
  
  // Initialize chart
  chartInstance = echarts.init(chartRef.value);
  
  // Filter out the final summary entry if present
  const trainingData = trainingLogs.value.filter(log => log.step !== undefined);
  
  // Prepare data
  const steps = trainingData.map(log => log.step);
  const losses = trainingData.map(log => log.loss | log.train_loss);
  const learningRates = trainingData.map(log => log.learning_rate);
  
  // Chart options
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['Loss', 'Learning Rate']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: steps,
      name: 'Step'
    },
    yAxis: [
      {
        type: 'value',
        name: 'Loss',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6'
          }
        },
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: 'Learning Rate',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#EE6666'
          }
        },
        axisLabel: {
          formatter: (value: number) => value.toExponential(2)
        },
        min: 0,
        max: Math.max(...learningRates) * 1.1
      }
    ],
    series: [
      {
        name: 'Loss',
        type: 'line',
        smooth: true,
        data: losses,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#5470C6'
        }
      },
      {
        name: 'Learning Rate',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: learningRates,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#EE6666'
        }
      }
    ]
  };
  
  chartInstance.setOption(option);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
};

// Clean up chart when component unmounts
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// Navigate to chat interface
const handleUseModel = () => {
  router.push({
    path: '/intro',
    query: {
      config_name: fineTunedModel?.value?.name,
      model_config_id: fineTunedModel?.value?.id,
      model_type: 'finetuned'
    }
  });
};

onMounted(() => {
  loadModelDetails();
});
</script>

<template>
  <div class="detail-container">
    <div class="header-section">
      <el-button type="text" :icon="ArrowLeft" @click="router.go(-1)" class="back-button">返回</el-button>
      <h1><el-icon :size="28" style="vertical-align: middle; margin-right: 12px;"><Cpu /></el-icon>微调模型详情</h1>
    </div>
    
    <div class="content-container" v-loading="loading">
      <!-- Basic Info Section -->
      <div class="info-section" v-if="fineTunedModel">
        <div class="model-header">
          <h2>{{ fineTunedModel.name }}</h2>
          <el-tag :type="fineTunedModel.status === 'completed' ? 'success' : 
                         fineTunedModel.status === 'training' ? 'primary' : 'danger'" size="large">
            {{ fineTunedModel.status === 'completed' ? '已完成' : 
               fineTunedModel.status === 'training' ? '训练中' : '失败' }}
          </el-tag>
        </div>
        
        <p class="model-description">{{ fineTunedModel.describe || '暂无描述' }}</p>
        
        <div class="model-meta">
          <div class="meta-item">
            <span class="meta-label">更新时间:</span>
            <span class="meta-value">{{ fineTunedModel.updated_at }}</span>
          </div>
          <div class="meta-item" v-if="baseModel">
            <span class="meta-label">基础模型:</span>
            <span class="meta-value">{{ baseModel.name }}</span>
          </div>
          <div class="meta-item" v-if="baseModel">
            <span class="meta-label">基础模型描述:</span>
            <span class="meta-value">{{ baseModel.describe }}</span>
          </div>
        </div>
      </div>
      
      <!-- Parameters Section -->
      <div class="params-section" v-if="fineTunedRecord">
        <h3>训练参数</h3>
        <div class="params-grid">
          <div class="param-item">
            <span class="param-label">训练类型:</span>
            <span class="param-value">{{ fineTuneDocument?.type === 'dialogue' ? '对话' : 
                                      fineTuneDocument?.type === 'instruction' ? '指令' : '无监督' }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">训练轮数:</span>
            <span class="param-value">{{ fineTunedRecord.num_train_epochs }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">使用LoRA:</span>
            <span class="param-value">{{ fineTunedRecord.use_lora ? '是' : '否' }}</span>
          </div>
          <div class="param-item" v-if="fineTunedRecord.use_lora">
            <span class="param-label">LoRA秩 (r):</span>
            <span class="param-value">{{ fineTunedRecord.lora_r }}</span>
          </div>
          <div class="param-item" v-if="fineTunedRecord.use_lora">
            <span class="param-label">LoRA Alpha:</span>
            <span class="param-value">{{ fineTunedRecord.lora_alpha }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">FP16:</span>
            <span class="param-value">{{ fineTunedRecord.fp16 ? '是' : '否' }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">4位量化:</span>
            <span class="param-value">{{ fineTunedRecord.load_in_4bit ? '是' : '否' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Training Logs Section -->
      <div class="logs-section" v-if="showLogChart">
        <h3>训练日志</h3>
        <div ref="chartRef" class="chart-container"></div>
      </div>
      
      <!-- Actions Section -->
      <div class="actions-section">
        <el-button 
          type="primary" 
          :icon="ChatDotRound" 
          @click="handleUseModel"
          :disabled="fineTunedModel?.status !== 'completed'"
        >
          使用模型
        </el-button>
        <el-button 
          type="primary" 
          :icon="View" 
          @click="handleViewLogs"
          :disabled="fineTunedModel?.status !== 'completed'"
        >
          查看日志
        </el-button>
        <el-button 
          type="success" 
          :icon="Download" 
          @click="handleDownloadLogs"
          :disabled="fineTunedModel?.status !== 'completed'"
        >
          下载日志
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.header-section h1 {
  font-size: 28px;
  margin: 20px 0 10px;
  color: #2c3e50;
}

.back-button {
  position: absolute;
  left: 0;
  top: 10px;
  font-size: 16px;
}

.content-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.info-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.model-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.model-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.model-description {
  color: #606266;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.model-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.meta-label {
  color: #909399;
  font-weight: 500;
}

.meta-value {
  color: #606266;
}

.params-section,
.logs-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.params-section h3,
.logs-section h3 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #3498db;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
  display: inline-block;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.param-label {
  color: #909399;
  font-weight: 500;
}

.param-value {
  color: #606266;
}

.chart-container {
  width: 100%;
  height: 400px;
  margin-top: 20px;
}

.actions-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.actions-section .el-button {
  width: 180px;
  height: 45px;
  font-size: 16px;
}

/* Responsive design */
@media (max-width: 768px) {
  .detail-container {
    padding: 15px;
  }
  
  .content-container {
    padding: 20px;
  }
  
  .model-meta,
  .params-grid {
    grid-template-columns: 1fr;
  }
  
  .model-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .actions-section {
    flex-direction: column;
    align-items: center;
  }
  
  .actions-section .el-button {
    width: 100%;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style>