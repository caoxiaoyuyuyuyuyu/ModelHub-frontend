import type { ChatMessage, Conversation } from '../types/chat'
import api from '../utils/api'
import { getCurrentTime } from '../utils/common'

export type ConversationsResponse = {
  conversation_info: Conversation,
  history: {
    count: number,
    messages: ChatMessage[]
  }
}
export const getConversations = async () => { 
    const response = await api.get('/chat/histories')
    return response.data.data.map((item: ConversationsResponse) => ({
      ...item.conversation_info,  // 展开conversation_info
      count: item.history.count,  // 添加count字段
      messages: item.history.messages  // 添加messages数组
    }))
}

export const getMessages = async (formDate: FormData) => { 
    const response = await api.post('/chat/history', formDate, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data.data
}

export const chat = async (formDate: FormData) => { 
    if(formDate.get('model_type') === 'finetuned'){
      const response = await api.post('/finetuning/chat', formDate)
      return {...response.data.data.response,
        create_at: getCurrentTime(),
      }
    } 
    if(formDate.get('model_type') === 'base'){
      console.log("base",formDate)
      const response = await api.post('/finetuning/base/chat', formDate)
      return {...response.data.data.response,
        create_at: getCurrentTime(),
      }
    }
    if(formDate.get('model_type') === 'ollama'){
      const response = await api.post('/ollama/chat', formDate)
      console.log("ollama",response.data)
      return {...response.data.data.response,
        create_at: getCurrentTime(),
      }
    }
    if(formDate.get('model_type') === 'ollama_config'){
      const response = await api.post('/ollama/config/chat', formDate)
      console.log("ollama_config",response.data)
      return {...response.data.data.response,
        create_at: getCurrentTime(),
      }
    }
    const response = await api.post('/chat/', formDate, { headers: { 'Content-Type': 'multipart/form-data' } })
    return {...response.data.data.response,
      create_at: getCurrentTime(),
      conversation_id: response.data.data.conversation_id,
      conversation_name : response.data.data.conversation_name
    }
}

export const rechat = async (formDate: FormData) => { 
    const response = await api.post('/chat/rechat', formDate, { headers: { 'Content-Type': 'multipart/form-data' } })
    console.log("原始",response)
    return {...response.data.data.response,
      create_at: getCurrentTime(),
      conversation_id: response.data.data.conversation_id,
      conversation_name : response.data.data.conversation_name
    }
}

export const setChatHistory = async (conversation_id: string, chat_history: string) => { 
  const formData = new FormData()
  formData.append('conversation_id', conversation_id)
  formData.append('chat_history', chat_history)
  const response = await api.post('/chat/set', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return response.data.data
}