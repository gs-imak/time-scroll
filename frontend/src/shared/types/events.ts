export type EventCategory = 'war' | 'discovery' | 'cultural' | 'political' | 'construction' | 'natural';

export interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  year: number;
  endYear?: number;
  eraId: string;
  latitude: number;
  longitude: number;
  category: EventCategory;
  imageUrl?: string;
  videoUrl?: string;
  images?: string[];
  impactText?: string;
  locationName?: string;
  sources?: string[];
}
