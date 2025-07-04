export interface Profile {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'read_only';
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  title: string;
  description?: string;
  content: string;
  encrypted_content?: string;
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  profile?: Profile;
}