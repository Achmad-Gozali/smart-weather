// Unified WeatherData type — snake_case to match OpenWeatherMap API output
// Previously had camelCase (windSpeed, feelsLike) which conflicted with useWeather hook
export interface WeatherData {
  city: string;
  temp: number;
  temp_min: number;
  temp_max: number;
  feels_like: number;       // ← snake_case
  condition?: string;
  description: string;
  humidity: number;
  wind_speed: number;       // ← snake_case
  visibility: number;
  icon?: string;            // ← tambah ini
}

export interface WeatherResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
}