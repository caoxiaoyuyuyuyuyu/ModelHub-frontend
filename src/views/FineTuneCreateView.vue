<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Upload, Cpu } from '@element-plus/icons-vue';
import type { BaseModel } from '../types/model';
import { fetchBaseModels, startFineTuning } from '../api/fintuning';
import { ElMessage } from 'element-plus';

const router = useRouter();
const baseModels = ref<BaseModel[]>([]);
const loading = ref(false);

// 表单数据
const form = ref({
  base_model_id: null as number | null,
  model_name: '',
  describe: '',
  fp16: false,
  use_lora: true,
  lora_r: 8,
  lora_alpha: 16,
  lora_dropout: 0.05,
  gradient_accumulation_steps: 1,
  num_train_epochs: 3,
  logging_steps: 50,
  load_in_4bit: false,
  training_type: 'dialogue'
});


// 表单验证规则
const formRules = {
  base_model_id: [{ required: true, message: '请选择基础模型', trigger: 'change' }],
  model_name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  training_type: [{ required: true, message: '请选择训练类型', trigger: 'change' }],
  lora_r: [
    { required: true, message: '请输入LoRA秩', trigger: 'blur' },
    { type: 'number', min: 1, max: 64, message: '秩必须在1-64之间', trigger: 'blur' }
  ],
  lora_alpha: [
    { required: true, message: '请输入LoRA alpha', trigger: 'blur' },
    { type: 'number', min: 1, max: 128, message: 'alpha必须在1-128之间', trigger: 'blur' }
  ],
  num_train_epochs: [
    { required: true, message: '请输入训练轮数', trigger: 'blur' },
    { type: 'number', min: 1, max: 20, message: '训练轮数必须在1-20之间', trigger: 'blur' }
  ],
};

// 提交微调请求
const submitFineTune = async () => {
  loading.value = true;
  try {
    if (!form.value.base_model_id || !form.value.model_name) {
      throw new Error('请填写必填字段');
    }
    
    if (!uploadForm.value.file) {
      throw new Error('请上传训练文件');
    }

    const formData = new FormData();
    
    // 添加表单数据
    Object.entries(form.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // 添加单个文件
    formData.append('file', uploadForm.value.file);

    ElMessage.success('开始微调');
    // 返回上一个页面
    router.back();
    
    startFineTuning(formData).then((result) => { 
      console.log('微调结果:', result);
      ElMessage.success('微调任务完成');
    });
    
  } catch (error: any) {
    console.error('微调失败:', error);
    ElMessage.error(error.message || '微调失败');
  } finally {
    loading.value = false;
  }
};

// 加载基础模型
onMounted(async () => {
  loading.value = true;
  try {
    baseModels.value = await fetchBaseModels();
  } catch (error) {
    console.error('加载基础模型失败:', error);
  } finally {
    loading.value = false;
  }
});
const uploadForm = ref({
  file: null as File | null,  // 改为存储单个文件
  describe: ''
});

// 处理文件选择 - 修改为支持多个文件
const handleFileChange = (uploadFile: any) => {
  uploadForm.value.file = uploadFile.raw || uploadFile; // 存储单个文件
  return false; // 阻止自动上传
};

</script>

<template>
  <div class="create-container">
    <div class="header-section">
      <el-button type="text" :icon="ArrowLeft" @click="router.go(-1)" class="back-button">返回</el-button>
      <h1><el-icon :size="28" style="vertical-align: middle; margin-right: 12px;"><Cpu /></el-icon>创建微调模型</h1>
      <p class="subtitle">配置参数并上传训练数据以创建新的微调模型</p>
    </div>
    <div class="form-container">
      <el-form 
        :model="form" 
        :rules="formRules" 
        label-width="180px" 
        label-position="top"
        class="fine-tune-form"
        v-loading="loading"
      >
        <!-- 基础设置 -->
        <div class="form-section">
          <h3>基础设置</h3>
          <div class="section-content">
            <el-form-item label="模型名称" prop="model_name">
              <el-input v-model="form.model_name" placeholder="请输入微调模型名称" />
            </el-form-item>
            
            <el-form-item label="基础模型" prop="base_model_id">
              <el-select
                v-model="form.base_model_id"
                placeholder="请选择基础模型"
                style="width: 100%"
              >
                <el-option
                  v-for="model in baseModels"
                  :key="model.id"
                  :label="model.name"
                  :value="model.id"
                >
                  <div class="model-option">
                    <span>{{ model.name }}</span>
                    <span class="model-describe">{{ model.describe }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="模型描述">
              <el-input
                v-model="form.describe"
                type="textarea"
                :rows="3"
                placeholder="请输入模型描述..."
              />
            </el-form-item>
          </div>
        </div>
        
        <!-- 训练数据 -->
        <div class="form-section">
          <h3>训练数据</h3>
          <div class="section-content">
             <el-form-item label="训练文件" prop="training_files">
                <el-upload
                    class="upload-demo"
                    drag
                    :auto-upload="false"
                    :show-file-list="true"
                    :on-change="handleFileChange"
                    :limit="1"
                    :file-list="uploadForm.file ? [uploadForm.file] : []"
                    >
                    <el-icon class="el-icon--upload"><upload /></el-icon>
                    <div class="el-upload__text">
                        拖拽文件到此处或<em>点击选择文件</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                        支持PDF、Word、TXT、JSON等文档格式
                        </div>
                    </template>
                </el-upload>
                <div v-if="uploadForm.file" class="file-item">
                <el-icon><document /></el-icon>
                {{ uploadForm.file.name }} ({{ (uploadForm.file.size / 1024 / 1024).toFixed(2) }} MB)
                </div>
            </el-form-item>
            <el-form-item label="训练类型" prop="training_type">
              <el-select v-model="form.training_type" placeholder="请选择训练类型">
                <el-option label="对话" value="dialogue" />
                <el-option label="指令" value="instruction" />
                <el-option label="无监督" value="plain" />
              </el-select>
            </el-form-item>
          </div>
        </div>
        
        <!-- 训练参数 -->
        <div class="form-section">
          <h3>训练参数</h3>
          <div class="section-content grid-layout">
            <el-form-item label="训练轮数" prop="num_train_epochs">
              <el-input-number v-model="form.num_train_epochs" :min="1" :max="20" />
            </el-form-item>
            
            <el-form-item label="梯度累积步数" prop="gradient_accumulation_steps">
              <el-input-number v-model="form.gradient_accumulation_steps" :min="1" :max="32" />
            </el-form-item>
            
            <el-form-item label="日志记录步数" prop="logging_steps">
              <el-input-number v-model="form.logging_steps" :min="10" :max="500" />
            </el-form-item>
            
            <el-form-item label="使用FP16" prop="fp16">
              <el-switch v-model="form.fp16" />
            </el-form-item>
            
            <el-form-item label="4位量化加载" prop="load_in_4bit">
              <el-switch v-model="form.load_in_4bit" />
            </el-form-item>
          </div>
        </div>
        
        <!-- LoRA参数 -->
        <div class="form-section" v-if="form.use_lora">
          <h3>LoRA参数</h3>
          <div class="section-content grid-layout">
            <el-form-item label="使用LoRA" prop="use_lora">
              <el-switch v-model="form.use_lora" />
            </el-form-item>
            
            <el-form-item label="LoRA秩 (r)" prop="lora_r">
              <el-input-number v-model="form.lora_r" :min="1" :max="64" />
            </el-form-item>
            
            <el-form-item label="LoRA Alpha" prop="lora_alpha">
              <el-input-number v-model="form.lora_alpha" :min="1" :max="128" />
            </el-form-item>
            
            <el-form-item label="Dropout率" prop="lora_dropout">
              <el-input-number v-model="form.lora_dropout" :min="0" :max="0.5" :step="0.01" />
            </el-form-item>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="router.go(-1)">取消</el-button>
          <el-button type="primary" @click="submitFineTune" :loading="loading">开始微调</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
/* 添加进度条颜色 */
:deep(.el-progress__text) {
  font-size: 20px !important;
}
.create-container {
  max-width: 1200px;
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

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
  margin-top: 5px;
}

.back-button {
  position: absolute;
  left: 0;
  top: 10px;
  font-size: 16px;
}

.form-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 20px;
}

.form-section h3 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #3498db;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
  display: inline-block;
}

.section-content {
  padding: 0 20px;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.model-option {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.model-describe {
  color: #95a5a6;
  font-size: 0.9em;
  margin-left: 15px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.form-actions .el-button {
  width: 150px;
  height: 45px;
  font-size: 16px;
}

.upload-demo {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .create-container {
    padding: 15px;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .grid-layout {
    grid-template-columns: 1fr;
  }
  
  .section-content {
    padding: 0;
  }
  
  .form-section h3 {
    font-size: 18px;
  }
  
  .header-section h1 {
    font-size: 24px;
  }
  
  .form-actions .el-button {
    width: 120px;
  }
}
</style>