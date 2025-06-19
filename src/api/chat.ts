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
    const response = await api.post('/chat/', formDate, { headers: { 'Content-Type': 'multipart/form-data' } })
    return {...response.data.data.response,
      create_at: getCurrentTime(),
    }
}