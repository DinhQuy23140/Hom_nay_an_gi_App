import { StyleSheet, View } from 'react-native';

import { AppText, Gradient, Icon, PressableScale, Skeleton } from '@/components/ui';
import { radius, spacing } from '@/theme';

import { useWeather } from '../use-weather';

/** Chip ngữ cảnh: thời tiết + khu vực, hoặc lời mời bật vị trí. */
export function WeatherPill() {
  const { granted, permission, requestPermission, weather, district, loading } = useWeather();

  if (loading) return <Skeleton width={180} height={32} radius={radius.pill} />;

  if (!granted) {
    if (permission && !permission.canAskAgain) return null;
    return (
      <PressableScale
        onPress={() => void requestPermission()}
        accessibilityRole="button"
        style={styles.pill}>
        <Gradient name="lagoon" direction="horizontal" fill />
        <Icon name="location-outline" size={16} color="secondaryText" />
        <AppText variant="label" color="secondaryText">
          Bật vị trí để gợi ý theo thời tiết
        </AppText>
      </PressableScale>
    );
  }

  if (!weather) return null;

  return (
    <View
      accessible
      accessibilityLabel={`${weather.label}, ${Math.round(weather.temperature)} độ${district ? `, ${district}` : ''}`}
      style={styles.pill}>
      <Gradient name="lagoon" direction="horizontal" fill />
      <Icon name={weather.icon} size={16} color="secondaryText" />
      <AppText variant="label" color="secondaryText" tabular numberOfLines={1}>
        {Math.round(weather.temperature)}° · {weather.label}
        {district ? ` · ${district}` : ''}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
