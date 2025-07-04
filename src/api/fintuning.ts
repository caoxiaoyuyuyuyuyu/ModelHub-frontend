import type { FineTunedModel } from '../types/model';
import api from '../utils/api'
export const fetchFineTunedModels = async (): Promise<FineTunedModel[]> => {
  const response = await api.get('/finetuning/finetuning_model/list');
  
  // 使用 map 返回处理后的数组
  return response.data.data
}

export const fetchBaseModels = async () => {
  const response = await api.get('/finetuning/pre_finetuning_model/list')
  return response.data.data
}

export const startFineTuning = async (formData: FormData) => {
  formData.append('data_type', 'dialogue')
  const response = await api.post('/finetuning/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'  // 覆盖默认的 JSON Content-Type
        }
    });
  return response.data.data
}

export const fetchFineTunedModelById = async (id : number) => {
  const response = await api.get(`/finetuning/get/${id}`)
  return response.data.data
}

export const getFineTuneLogs = async (id: number) => {
  const response = await api.get(`/finetuning/download_logs?id=${id}`)
  return response.data
}

export const downLoadLogs = async (id: number) => { 
  const response = api.get(`/finetuning/download_logs?id=${id}`, {
      responseType: 'blob', // 指定响应类型为二进制数据
    });
  return response;
}
export const getFineTunedModelConfig = async (id: number) => { 
  const response = await api.get(`/finetuning/get_model_config/${id}`)
  return response.data.data
}

export const fetchLocalModels = async () => { 
  const response = await api.get(`/finetuning/pre_finetuning_model/list`)
  return response.data.data
}

export const createBaseModel = async (formData: FormData) => { 
  const response = await api.post(`/finetuning/base/create`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'  // 覆盖默认的 JSON Content-Type
        }
    });
  return response.data.data
}
export const AddOllamaModels = async (formData: FormData) => { 
  const response = await api.post(`/ollama_model/modelinfo/create`, formData);
  return response.data.data
}