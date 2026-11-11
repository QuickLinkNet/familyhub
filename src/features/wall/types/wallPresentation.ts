export interface WallPhoto {
  id: string;
  name: string;
  createdAt: string;
}

export interface WallForecastDay {
  date: string;
  minimum: number;
  maximum: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface WallWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  forecast: WallForecastDay[];
}

export interface WallPresentationSettings {
  greeting: string;
  weatherEnabled: boolean;
  weatherLocation: string | null;
  weatherLatitude: number | null;
  weatherLongitude: number | null;
  photos: WallPhoto[];
}

export interface WallPresentation extends WallPresentationSettings {
  weather: WallWeather | null;
}

export interface WallPresentationInput {
  greeting: string;
  weatherEnabled: boolean;
  weatherLocation: string;
}
