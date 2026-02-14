// Tipos do CRM Editorial B NEWS

export type ArticleStatus = 
  | 'captured'
  | 'rewritten'
  | 'pending'
  | 'approved'
  | 'needs_image'
  | 'scheduled'
  | 'published'
  | 'rejected';

export type SourceType = 'rss' | 'website' | 'api';
export type CredibilityLevel = 'high' | 'medium' | 'low';
export type AppRole = 'admin' | 'editor_chefe' | 'editor' | 'revisor';

export interface Source {
  id: string;
  name: string;
  url: string;
  feed_url: string | null;
  type: SourceType;
  credibility: CredibilityLevel;
  categories: string[] | null;
  include_keywords: string[] | null;
  exclude_keywords: string[] | null;
  country: string | null;
  language: string | null;
  is_active: boolean;
  last_fetch_at: string | null;
  articles_captured: number;
  duplicates_found: number;
  fetch_interval_minutes: number;
  created_at: string;
  updated_at: string | null;
}

export interface Article {
  id: string;
  // Dados originais
  original_title: string | null;
  original_content: string | null;
  source_id: string | null;
  source_url: string | null;
  captured_at: string;
  // Dados B NEWS
  title: string | null;
  lead: string | null;
  content: string | null;
  quick_facts: string[] | null;
  tags: string[] | null;
  category: string | null;
  location: string | null;
  // Publicação
  image_url: string | null;
  image_caption: string | null;
  highlight_type: 'hero' | 'trending' | 'normal';
  seo_slug: string | null;
  seo_title: string | null;
  // Notícia Visual
  content_type: 'article' | 'visual';
  visual_format: 'vertical' | 'horizontal' | null;
  gallery_urls: string[] | null;
  // Estado
  status: ArticleStatus;
  confidence_score: number | null;
  is_duplicate: boolean;
  duplicate_of: string | null;
  // Meta
  reading_time: number | null;
  author: string | null;
  editor_id: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  source?: Source;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface AgentLogDetails {
  message?: string;
  source_name?: string;
  source_url?: string;
  source_type?: string;
  response_size_kb?: number;
  duration_ms?: number;
  items_found?: number;
  items_saved?: number;
  duplicates_skipped?: number;
  article_id?: string;
  article_title?: string;
  error?: string;
  existing_urls?: number;
  existing_titles?: number;
  sources_processed?: number;
  total_found?: number;
  total_saved?: number;
  total_duplicates?: number;
  total_rewritten?: number;
  rewrite_errors?: number;
  errors_count?: number;
  action_type?: string;
  title_preview?: string;
  tokens_used?: number;
  timestamp?: string;
  source_filter?: string;
  auto_rewrite?: boolean;
}

export interface AgentLog {
  id: string;
  source_id: string | null;
  action: string | null;
  status: string | null;
  articles_found: number;
  articles_saved: number;
  error_message: string | null;
  executed_at: string;
  details?: AgentLogDetails | null;
  source?: Source;
}

export interface SponsoredCampaign {
  id: string;
  name: string;
  advertiser: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SponsoredAd {
  id: string;
  campaign_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  placement: 'feed' | 'hero' | 'sidebar';
  frequency: number;
  impressions: number;
  clicks: number;
  is_active: boolean;
  created_at: string;
  campaign?: SponsoredCampaign;
}

// Labels em português
export const STATUS_LABELS: Record<ArticleStatus, string> = {
  captured: 'Captada',
  rewritten: 'Reescrita',
  pending: 'Pendente',
  approved: 'Aprovada',
  needs_image: 'Foto em falta',
  scheduled: 'Agendada',
  published: 'Publicada',
  rejected: 'Rejeitada',
};

export const STATUS_COLORS: Record<ArticleStatus, string> = {
  captured: 'bg-slate-500',
  rewritten: 'bg-blue-500',
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  needs_image: 'bg-orange-500',
  scheduled: 'bg-purple-500',
  published: 'bg-emerald-600',
  rejected: 'bg-red-500',
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  editor_chefe: 'Editor-Chefe',
  editor: 'Editor',
  revisor: 'Revisor',
};

export const CREDIBILITY_LABELS: Record<CredibilityLevel, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  rss: 'RSS',
  website: 'Website',
  api: 'API',
};
