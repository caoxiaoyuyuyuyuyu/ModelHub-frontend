// types/user.ts
import { ModelConfig } from "./model_config";
export class User {
  id!: number;
  username!: string;
  email!: string;
  create_at!: Date;
  update_at!: Date;
  
  // 关系字段
  model_configs?: ModelConfig[];
}