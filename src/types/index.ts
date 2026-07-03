/**
 * Shared domain types. Feature-specific types live inside the feature.
 */

export interface Memory {
  id: string;
  title: string;
  caption?: string;
  takenAt: string;
  placeId?: string;
  personIds?: string[];
  coverUrl?: string;
}

export interface Person {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Place {
  id: string;
  name: string;
  region?: string;
  lat?: number;
  lng?: number;
}
