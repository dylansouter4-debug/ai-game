export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; // Only for files
  children?: FileNode[]; // Only for folders
  isOpen?: boolean; // For folder UI state
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
  timestamp: number;
}
