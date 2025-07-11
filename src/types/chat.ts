export class ChatMessage {
  role!: "system" | "user" | "assistant";
  content!: string;
  create_at!: string;
}
export class Conversation {
  id!: number;
  name!: string;
  chat_history!: number;
  model_config_id!: number;
  create_at!: string;
  update_at!: string;
  type!: number;
  messages!: ChatMessage[];
  last_message?: ChatMessage;
}
