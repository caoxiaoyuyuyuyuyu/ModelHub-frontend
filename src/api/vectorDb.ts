import api from "../utils/api";
export const createVectorDb = async (data: any) => { 
    return await api.post('/vector/create', data)
}

export const fetchOwnVectors = async () => { 
    const response = await api.get('/vector/list')
    return response.data.data
}

export const getVectorDb = async (id: number) => { 
    const response = await api.get(`/vector/get/${id}`)
    return response.data.data
}

export const updateVectorDb = async (id: number, data: any) => { 
    return await api.post(`/vector/update/${id}`, data);
}


export const uploadDocument = async (formData: FormData) => {
    const response = await api.post('/vector/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'  // 覆盖默认的 JSON Content-Type
        },
        transformRequest: (data) => data  // 禁用默认的JSON转换
    });
    return response.data.data;
};

export const DownloadFile = async (id: number) => {
    const response = await api.get(`/vector/download_file/${id}`, {
      responseType: 'blob', // 指定响应类型为二进制数据
    });
    return response;
}
export const deleteDocument = async (id: number) => { 
    return await api.delete(`/vector/delete/${id}`)
}

export const deleteVectorDb = async (id: number) => { 
    const response = await api.delete(`/vector/delete/${id}`)
    return response.data.data
}

export const testConnect = async (id: number) => { 
    const response = await api.get(`/vector/connect/${id}`)
    return response.status === 200
}

export const queryVector = async (id: number, query_text: string, n_results: number) => { 
    const response = await api.post(`/vector/query/${id}`, {
        query_text: query_text,
        n_results: n_results
    })
    return response.data.data
}