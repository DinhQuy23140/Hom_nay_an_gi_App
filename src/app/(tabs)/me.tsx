import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText, Avatar, Gradient, ListGroup, ListRow, Screen } from '@/components/ui';
import { useProfile, useUserData } from '@/features/profile/user-data-provider';
import { motion, radius, spacing, useMotion } from '@/theme';

/** Tab Tôi (/me): thông tin tài khoản, thống kê và lối vào Yêu thích, Lịch sử, Hồ sơ khẩu vị, Cài đặt. */
export default function MeScreen() {
  const { pick } = useMotion();
  const profile = useProfile();
  const { favorites, history } = useUserData();
  const selections = history.filter((e) => e.type === 'SELECT').length;
  const restrictionCount = profile.restrictions.allergens.length + profile.restrictions.diets.length;

  const stats = [
    { label: 'Yêu thích', value: favorites.size },
    { label: 'Đã chốt', value: selections },
    { label: 'Kiêng', value: restrictionCount },
  ];

  return (
    <Screen scroll contentStyle={styles.content}>
      <Animated.View entering={pick(FadeInDown.duration(motion.duration.slow).easing(motion.easing))} style={styles.profile}>
        <Avatar name={profile.displayName} uri={profile.photoURL} size={72} />
        <View style={styles.flex}>
          <AppText variant="headline" numberOfLines={1}>
            {profile.displayName ?? 'Bạn'}
          </AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={1}>
            {profile.email}
          </AppText>
        </View>
      </Animated.View>

      <Gradient name="brand" style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <AppText variant="headline" color="onPrimary" tabular>
              {stat.value}
            </AppText>
            <AppText variant="caption" color="onPrimary">
              {stat.label}
            </AppText>
          </View>
        ))}
      </Gradient>

      <ListGroup>
        <ListRow icon="heart-outline" title="Món yêu thích" onPress={() => router.push('/favorites')} />
        <ListRow icon="time-outline" title="Lịch sử ăn uống" onPress={() => router.push('/history')} />
        <ListRow
          icon="restaurant-outline"
          title="Hồ sơ khẩu vị"
          subtitle="Dị ứng, chế độ ăn, mức cay, ngân sách"
          onPress={() => router.push('/taste-profile')}
        />
      </ListGroup>

      <ListGroup>
        <ListRow icon="settings-outline" title="Cài đặt" onPress={() => router.push('/settings')} />
      </ListGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: spacing.lg, paddingTop: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stats: { flexDirection: 'row', borderRadius: radius.lg, paddingVertical: spacing.md, overflow: 'hidden' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
});
