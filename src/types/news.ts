export type CategoryId = 
  | 'economia' 
  | 'politica' 
  | 'sociedade' 
  | 'entretenimento' 
  | 'tecnologia' 
  | 'internacional' 
  | 'desporto';

export interface Category {
  id: CategoryId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: CategoryId;
  imageUrl?: string;
  publishedAt: string;
  readingTime: number;
  author: string;
  quickFacts: string[];
  relatedArticleIds: string[];
  tags?: string[];
  contentType?: 'article' | 'visual';
  visualFormat?: 'vertical' | 'horizontal';
  galleryUrls?: string[];
}

export interface SponsoredAd {
  id: string;
  title: string;
  imageUrl: string;
  sponsor: string;
  link: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSuggestion {
  id: string;
  text: string;
  icon?: string;
}
