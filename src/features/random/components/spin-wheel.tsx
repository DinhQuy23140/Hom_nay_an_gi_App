import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { Button, Icon, PressableScale } from '@/components/ui';
import { pickWeighted, type ScoredFood } from '@/features/recommendation/engine';
import { haptics } from '@/lib/haptics';
import { fontFamily, radius, spacing, useAppTheme, useMotion, type ColorName } from '@/theme';

import { interleave } from '../pool';

const MAX_SEGMENTS = 8;
const FULL_TURNS = 5;
const SEGMENT_TONES: ColorName[] = ['primaryContainer', 'secondaryContainer', 'dessertContainer', 'surfaceVariant'];
const SPIN_EASING = Easing.bezier(0.15, 0.75, 0.15, 1);

interface SpinWheelProps {
  pool: readonly ScoredFood[];
  onResult: (picked: ScoredFood) => void;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${largeArc} 1 ${b.x} ${b.y} Z`;
}

/** Góc dừng trong lát được chọn, lệch ngẫu nhiên khỏi tâm lát để trông tự nhiên. */
function landingAngle(index: number, sweep: number) {
  const jitter = (Math.random() - 0.5) * sweep * 0.6;
  return index * sweep + sweep / 2 + jitter;
}

function shortName(name: string) {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}

/** Vòng quay chọn món vẽ bằng SVG, mỗi lát một món. */
export function SpinWheel({ pool, onResult }: SpinWheelProps) {
  const { colors } = useAppTheme();
  const { reduced } = useMotion();
  const { width } = useWindowDimensions();
  const [spinning, setSpinning] = useState(false);
  const rotation = useSharedValue(0);

  const size = Math.min(width - spacing.screen * 2, 340);
  const center = size / 2;
  const r = center - 4;
  const segments = interleave(pool.slice(0, MAX_SEGMENTS));
  const sweep = 360 / Math.max(segments.length, 1);

  const finish = (picked: ScoredFood) => {
    setSpinning(false);
    haptics.success();
    onResult(picked);
  };

  const spin = () => {
    const picked = pickWeighted(segments, { topN: segments.length });
    if (!picked || spinning) return;
    haptics.impact();

    const landing = landingAngle(segments.indexOf(picked), sweep);
    const start = rotation.get();
    const delta = (((360 - landing - (start % 360)) % 360) + 360) % 360;
    const target = start + FULL_TURNS * 360 + delta;

    if (reduced) {
      rotation.set(target);
      finish(picked);
      return;
    }
    setSpinning(true);
    rotation.set(
      withTiming(target, { duration: 3200, easing: SPIN_EASING }, (done) => {
        if (done) scheduleOnRN(finish, picked);
      }),
    );
  };

  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Animated.View style={[StyleSheet.absoluteFill, wheelStyle]}>
          <Svg width={size} height={size}>
            {segments.map((scored, i) => {
              const start = i * sweep;
              const mid = start + sweep / 2;
              const label = polar(center, center, r * 0.6, mid);
              return (
                <G key={scored.food.slug}>
                  <Path
                    d={segmentPath(center, center, r, start, start + sweep)}
                    fill={colors[SEGMENT_TONES[i % SEGMENT_TONES.length]]}
                    stroke={colors.surface}
                    strokeWidth={2}
                  />
                  <SvgText
                    x={label.x}
                    y={label.y}
                    fill={colors.onSurface}
                    fontSize={12}
                    fontFamily={fontFamily.medium}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    transform={`rotate(${mid - 90}, ${label.x}, ${label.y})`}>
                    {shortName(scored.food.nameVi)}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Animated.View>

        <View pointerEvents="none" style={styles.pointer}>
          <Icon name="caret-down" size={40} color="primary" />
        </View>

        <PressableScale
          onPress={spin}
          disabled={spinning}
          accessibilityRole="button"
          accessibilityLabel="Quay vòng"
          style={[
            styles.hub,
            { backgroundColor: colors.primary, borderColor: colors.surface, left: center - 32, top: center - 32 },
          ]}>
          <Icon name="refresh" size={28} color="onPrimary" />
        </PressableScale>
      </View>

      <Button
        label={spinning ? 'Đang quay…' : 'Quay vòng'}
        icon="sync-outline"
        disabled={spinning || segments.length === 0}
        onPress={spin}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.xl },
  pointer: { position: 'absolute', top: -18, left: 0, right: 0, alignItems: 'center' },
  hub: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: { minWidth: 200 },
});
