export class FineTunedModel { 
    id!: number
    name!: string
    describe!: string
    record_id!: number
    updated_at!: string
    status!: string
}

export class BaseModel {
    id!: number
    name!: string
    describe!: string
    path!: string
    type!: string
    created_at!: string
}

export class FineTuneDocument {
    id!: number
    name!: string
    describe!: string
    type!: string
}

export class FineTuneRecord {
    id!: number;
    base_model_id!: number;
    load_in_4bit!: boolean;
    use_lora!: boolean;
    lora_r!: number;
    lora_alpha!: number;
    lora_dropout!: number;
    gradient_accumulation_steps!: number;
    num_train_epochs!: number;
    logging_steps!: number;
    save_strategy!: string;
    fp16!: boolean;
    optim!: string;
    output_dir!: string;
    log_path!: string;
    created_at!: string;
    fine_tuned_model!: FineTunedModel;
    base_model!: BaseModel;
    fine_tune_document!: FineTuneDocument;
}
export class LocalModel {
  id!: number;
  name!: string;
  path!: string;
  created_at!: string;
  describe?: string;
  type!: string;
}
export class OllamaModel {
  id!: number;
  model_name!: string;
  supplier!: string | null;
  describe!: string | null;
  model_configs!: OllamaModelConfig[];
  // create_at!: string;
  // update_at!: string;
}
export class OllamaModelConfig {
    id!: number;
    base_model_id!: number;
    name!: string;          // 配置名称
    num_keep!: number;
    num_predict!: number;
    temperature!: number;   // 温度参数
    top_p!: number;         // Top P 采样
    top_k!: number;         // Top K 采样
    describe!: string;      // 描述
    create_at!: string;     // 创建时间
    update_at!: string;
}