export type InteractionType = 'VIEW' | 'LIKE' | 'DISLIKE' | 'SKIP' | 'SELECT';

export type InteractionSurface = 'home' | 'random' | 'wheel' | 'swipe' | 'detail' | 'search';

export interface InteractionEvent {
  id: string;
  type: InteractionType;
  slug: string;
  surface: InteractionSurface;
  createdAt: Date;
}
