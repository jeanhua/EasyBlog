export interface User {
  ID: number;
  username: string;
  avatar?: string;
}

export interface Category {
  ID: number;
  name: string;
}

export interface Tag {
  ID: number;
  name: string;
}

export interface Post {
  ID: number;
  title: string;
  summary?: string;
  content?: string;
  cover_image?: string;
  author?: User;
  view_count?: number;
  created_at?: string;
  categories?: Category[];
  tags?: Tag[];
}

export interface Comment {
  ID: number;
  post_id: number;
  user_id?: number;
  content: string;
  created_at?: string;
}
