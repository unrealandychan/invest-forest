export type WeatherCondition = 'sunny' | 'breeze' | 'rain' | 'winter_snow';

export function calculateForestWeather(drawdownPercent: number): WeatherCondition {
  if (drawdownPercent <= -20) return 'winter_snow';
  if (drawdownPercent <= -10) return 'rain';
  if (drawdownPercent <= -3) return 'breeze';
  return 'sunny';
}
