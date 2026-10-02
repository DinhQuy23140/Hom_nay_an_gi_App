import { Accelerometer } from 'expo-sensors';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

const THRESHOLD_G = 1.8;
const COOLDOWN_MS = 1500;

/** Gọi `onShake` khi người dùng lắc máy; chỉ lắng nghe khi màn hình đang hiển thị. */
export function useShake(onShake: () => void, enabled = true) {
  const handlerRef = useRef(onShake);
  useEffect(() => {
    handlerRef.current = onShake;
  });

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      let last = 0;
      Accelerometer.setUpdateInterval(100);
      const subscription = Accelerometer.addListener(({ x, y, z }) => {
        const force = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        if (force > THRESHOLD_G && now - last > COOLDOWN_MS) {
          last = now;
          handlerRef.current();
        }
      });
      return () => subscription.remove();
    }, [enabled]),
  );
}
