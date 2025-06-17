import type { ModelConfig } from "./model_config";
import type { document } from "./document";

// types/vectorDb.ts
export class VectorDbBase {
  id!: number;
  name!: string;
  describe!: string;
  created_at!: string;
  updated_at!: string;
}

export interface VectorDbForm {
  id: number
  name: string
  describe: string
  embedding_id: number
  document_similarity: number
  created_at: string
  updated_at: string
  model_configs: ModelConfig[]
  documents: document[]
}