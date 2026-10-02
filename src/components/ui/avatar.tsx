import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { radius } from '@/theme';

import { AppText } from './app-text';
import { Gradient } from './gradient';

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
}

function initials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? '';
  return last.charAt(0).toUpperCase() || '?';
}

/** Ảnh đại diện tròn; chưa có ảnh thì hiện chữ cái đầu trên nền gradient. */
export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  const style = { width: size, height: size, borderRadius: radius.pill };

  if (uri) {
    return <Image source={{ uri }} style={style} contentFit="cover" accessibilityLabel={name ?? 'Ảnh đại diện'} />;
  }

  return (
    <Gradient name="leaf" style={[styles.fallback, style]}>
      <AppText variant={size >= 64 ? 'headline' : 'label'} color="primaryText">
        {initials(name)}
      </AppText>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
