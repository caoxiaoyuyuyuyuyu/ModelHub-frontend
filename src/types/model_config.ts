// types/model.ts

export class ModelInfo {
  id!: number;
  model_name!: string;
  describe?: string | null;
  type!: string;
}

export class ModelConfigResponse {
  id!: number;
  name!: string;
  author!: string;
  base_model_name!: string;
  description?: string | null;
  updated_at!: string;
}

export class ModelConfigBase{
  id!: number;
  title!: string;
  author!: string;
  isFeatured!: boolean;
  description!: string | null;
  avatar!: string | null;
  date!: string;
}
export class ModelConfig {
  id!: number;
  name!: string;
  description!: string | null;
  share_id!: string;
  base_model_id!: number;
  temprature!: number;
  top_p!: number;
  prompt!: string | null;
  vector_db_id?: number | null;
  created_at!: string;
  updated_at!: string;
  is_private!: boolean;
}

// 相关类型定义
export interface ModelConfigForm {
  id?: number | null;
  name: string;
  base_model_id: number | null;
  temprature: number;
  top_p: number;
  prompt: string;
  vector_db_id: number | null;
  is_private: boolean;
}