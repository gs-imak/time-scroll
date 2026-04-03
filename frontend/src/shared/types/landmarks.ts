export interface LandmarkTimePeriod {
  name: string;
  startYear: number;
  endYear: number;
  riveFile: string;
  label: string;
}

export interface Landmark {
  id: string;
  name: string;
  locationId: string;
  latitude: number;
  longitude: number;
  triggerZoom: number;
  triggerRadius: number;
  timePeriods: LandmarkTimePeriod[];
}
