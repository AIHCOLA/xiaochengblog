import client from './client';

export interface WeatherData {
  temp: number;
  condition: string;
  icon: 'sunny' | 'cloudy' | 'partly' | 'rain';
  humidity: number;
  wind: string;
  location: string;
  high: number;
  low: number;
}

export async function getWeather(lat?: number, lon?: number): Promise<WeatherData> {
  return client.get('/weather/now', { params: { lat, lon } }) as unknown as WeatherData;
}
