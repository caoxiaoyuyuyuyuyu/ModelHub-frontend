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
export const getModelConfig = async (id: number) => { 
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