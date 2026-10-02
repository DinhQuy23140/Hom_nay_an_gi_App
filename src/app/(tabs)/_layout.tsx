import { Tabs } from 'expo-router/js-tabs';

import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { useMotion } from '@/theme';

/** Layout 5 tab chính (Trang chủ, Khám phá, Random, Cộng đồng, Tôi) với thanh tab tùy biến. */
export default function TabsLayout() {
  const { reduced } = useMotion();
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: reduced ? 'none' : 'fade' }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="random" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
