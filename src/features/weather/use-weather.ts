import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';

import { fetchWeather, type WeatherInfo } from './weather.service';

interface LocalContext {
  weather: WeatherInfo;
  district: string | null;
}

async function loadLocalContext(): Promise<LocalContext> {
  const position =
    (await Location.getLastKnownPositionAsync({ maxAge: 30 * 60_000 })) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  const { latitude, longitude } = position.coords;

  const [weather, district] = await Promise.all([
    fetchWeather(latitude, longitude),
    Location.reverseGeocodeAsync({ latitude, longitude })
      .then(([place]) => place?.district ?? place?.subregion ?? place?.city ?? null)
      .catch(() => null),
  ]);
  return { weather, district };
}

/** Thời tiết và khu vực hiện tại; chỉ chạy khi người dùng đã cho phép vị trí. */
export function useWeather() {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const granted = permission?.granted ?? false;

  const query = useQuery({
    queryKey: ['local-context'],
    queryFn: loadLocalContext,
    enabled: granted,
    staleTime: 30 * 60_000,
  });

  return {
    permission,
    granted,
    requestPermission,
    weather: query.data?.weather ?? null,
    district: query.data?.district ?? null,
    loading: granted && query.isLoading,
  };
}
