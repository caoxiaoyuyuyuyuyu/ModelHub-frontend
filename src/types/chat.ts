export class ChatMessage {
  role!: "system" | "user" | "assistant";
  content!: string;
  time!: string;
}