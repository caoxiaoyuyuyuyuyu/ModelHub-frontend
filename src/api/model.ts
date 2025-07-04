import type { ModelInfo } from "../types/model_config"
import api from "../utils/api"
import { randomString } from "../utils/common"
export const getModelInfos = async () => { 
    const response = await api.get('/model//modelinfo/getlist')
    return response.data.data.filter((item:ModelInfo) => item.type === 'chatllm')
}

export const getEmbeddingModelInfos = async () => { 
    const response = await api.get('/model//modelinfo/getlist')
    return response.data.data.filter((item:ModelInfo) => item.type === 'embedding')
}

export const getModelInfo = async (id: number) => { 
    const response = await api.get(`/model/modelinfo/get/${id}`)
    return response.data.data
}
export const getModelConfig = async (id: number, type: number = 0) => { 
    if (type === 1) {
        const response = await api.get(`/ollama_model/modelinfo/get/${id}`)
        return {
            name: response.data.data.model_name
        }
    }else if (type === 2) {
        const response = await api.get(`/finetuning/get-base/${id}`)
        return {
            name: response.data.data.name
        }
    }
    const response = await api.get(`/model/modelconfig/get/${id}`)
    return response.data.data
}

export const getModelConfigs = async () => { 
    const response = await api.get('/model/modelconfig/getpublic')
    return response.data.data
}
export const fetchOwnConfigs = async () => { 
    const response = await api.get('/model/modelconfig/getuser')
    return response.data.data
}

export const getUserModelConfig = async (user_id: number) => { 
    const response = await api.get(`/model/modelconfig/getuser/${user_id}`)
    return response.data.data
}

export const createConfig = async (data: any) => { 
    data.share_id = randomString(10)
    data.user_id = 12
    return await api.post('/model/modelconfig/create', data)
}

export const updateConfig = async (data: any) => { 
    const response = await api.post('/model/modelconfig/update', data)
    return response.data.data
}

export const deleteModelConfig = async (id: number) => { 
    return await api.delete(`/model/modelconfig/delete/${id}`)
}

export const getModelConfigByShareId = async (share_id: string) => { 
    const response = await api.post(`/model/modelconfig/getshare`,{share_id:share_id})
    return response.data.data
}

export const fetchOllamaModels = async () => { 
    const response = await api.get('/ollama_model/modelinfo/getlist')
    return response.data.data
}

export const updateOllamaModelConfig = async (id: number, formData:any) => {
    const response = await api.post(`/ollama_model/modelconfig/update`, {
        id: id,
        ...formData})
    return response.data.data
} 

export const deleteOllamaModelConfig = async (id: number) => { 
    const response = await api.delete(`/ollama_model/modelconfig/delete/${id}`)
    return response.data.data
}
export const createOllamaModelConfig = async (data: any) => { 
    const response = await api.post(`/ollama_model/modelconfig/create`, data)
    return response.data.data
}