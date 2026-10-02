import type { IconName } from '@/components/ui';
import type { WeatherKind } from '@/features/recommendation/context';

export interface WeatherInfo {
  kind: WeatherKind;
  temperature: number;
  label: string;
  icon: IconName;
}

interface OpenMeteoResponse {
  current?: { temperature_2m: number; weather_code: number };
}

// Mã thời tiết WMO: mưa phùn, mưa, mưa rào, dông.
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

function classify(temperature: number, code: number): Omit<WeatherInfo, 'temperature'> {
  if (RAIN_CODES.has(code)) return { kind: 'RAIN', label: 'Trời đang mưa', icon: 'rainy-outline' };
  if (temperature <= 20) return { kind: 'COLD', label: 'Trời se lạnh', icon: 'snow-outline' };
  if (temperature >= 32) return { kind: 'HOT', label: 'Trời nắng nóng', icon: 'sunny-outline' };
  return { kind: 'MILD', label: 'Trời dễ chịu', icon: 'partly-sunny-outline' };
}

/** Open-Meteo: miễn phí, không cần API key. */
export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherInfo> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(3)}` +
    `&longitude=${longitude.toFixed(3)}&current=temperature_2m,weather_code&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
  const data = (await response.json()) as OpenMeteoResponse;
  if (!data.current) throw new Error('Weather response missing current data');
  const temperature = Math.round(data.current.temperature_2m);
  return { temperature, ...classify(temperature, data.current.weather_code) };
}
