import { defineStore } from 'pinia'

// 定义主题类型
export type Process = {
  model_id: number
  process: number
}

export const useProcessStore = defineStore('process', {
  state: () => ({
    // 可用主题列表
    Processes: [] as Process[],
  }),
  getters: {
  },
  actions: {
    setProcess(modelId: number, process: number) {
        console.log("setProcess", modelId, process)
        this.Processes.find(p => p.model_id === modelId)
        ? this.Processes.find(p => p.model_id === modelId)!.process = process
        : this.Processes.push({ model_id: modelId, process: process })
    },
    currentProcess(modelId: number): Process | undefined {
        return this.Processes.find(p => p.model_id === modelId)
    }
  }
})