export interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  defaultZoom: number;
  availableEras: string[];
}
