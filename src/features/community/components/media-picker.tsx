import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { AppText, Icon, IconButton, PressableScale, type IconName } from '@/components/ui';
import { motion, radius, spacing, useAppTheme, useMotion } from '@/theme';

import { MAX_IMAGES, type LocalMedia } from '../types';

const TILE = 96;

interface MediaPickerProps {
  media: LocalMedia[];
  onPickLibrary: () => void;
  onTakePhoto: () => void;
  onRemove: (uri: string) => void;
}

/** Khu chọn và xem trước ảnh/video khi đăng bài. */
export function MediaPicker({ media, onPickLibrary, onTakePhoto, onRemove }: MediaPickerProps) {
  const { pick } = useMotion();
  const hasVideo = media.some((m) => m.type === 'video');
  const canAdd = !hasVideo && media.length < MAX_IMAGES;

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {media.map((item) => (
          <Animated.View
            key={item.uri}
            entering={pick(ZoomIn.duration(motion.duration.normal))}
            exiting={pick(ZoomOut.duration(motion.duration.fast))}
            layout={pick(LinearTransition.duration(motion.duration.normal))}>
            <Thumbnail item={item} onRemove={() => onRemove(item.uri)} />
          </Animated.View>
        ))}
        {canAdd && (
          <Animated.View layout={pick(LinearTransition.duration(motion.duration.normal))} style={styles.row}>
            <AddTile icon="images-outline" label="Thư viện" onPress={onPickLibrary} />
            <AddTile icon="camera-outline" label="Chụp ảnh" onPress={onTakePhoto} />
          </Animated.View>
        )}
      </ScrollView>
      <AppText variant="caption" color="onSurfaceVariant">
        Tối đa {MAX_IMAGES} ảnh hoặc 1 video dưới 60 giây, mỗi file ≤ 50 MB.
      </AppText>
    </View>
  );
}

/** Ô xem trước một ảnh/video đã chọn, có nút xóa. */
function Thumbnail({ item, onRemove }: { item: LocalMedia; onRemove: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surfaceVariant }]}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={styles.videoTile}>
          <Icon name="videocam-outline" size={28} color="secondaryText" />
          <AppText variant="caption" color="secondaryText">
            Video
          </AppText>
        </View>
      )}
      <IconButton
        icon="close"
        variant="overlay"
        size={28}
        accessibilityLabel="Bỏ file này"
        onPress={onRemove}
        style={styles.remove}
      />
    </View>
  );
}

/** Ô thêm media mới. */
function AddTile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <PressableScale
      haptic
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.tile, styles.addTile, { borderColor: colors.primary, backgroundColor: colors.primaryContainer }]}>
      <Icon name={icon} size={26} color="primaryText" />
      <AppText variant="caption" color="primaryText">
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: { width: TILE, height: TILE, borderRadius: radius.md, overflow: 'hidden' },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  videoTile: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  remove: { position: 'absolute', top: 4, right: 4 },
});
