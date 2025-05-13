// components/LoadAnimation.tsx
import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../theme';

type Props = {
  active: boolean; // whether animation should keep running
  onFinish: () => void; // called when animation naturally ends
};

export default function LoadAnimation({ active, onFinish }: Props) {
  const { width, height } = Dimensions.get('window');
  const duration = 1500; // each phase duration

  // animated values
  const holeScale = useRef(new Animated.Value(0)).current;
  const blastScale = useRef(new Animated.Value(0)).current;
  const blastOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      // stop early if parent says so
      holeScale.stopAnimation();
      blastScale.stopAnimation();
      blastOpacity.stopAnimation();
      onFinish();
      return;
    }

    const sequence = Animated.sequence([
      // 1) enlarge hole
      Animated.timing(holeScale, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      // 2) shrink hole + expand+fade blast
      Animated.parallel([
        Animated.timing(holeScale, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(blastScale, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(blastOpacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const handleEnd = () => {
      onFinish();
      // reset for potential re-run
      holeScale.setValue(0);
      blastScale.setValue(0);
      blastOpacity.setValue(1);
    };

    sequence.start(handleEnd);

    return () => sequence.stop();
  }, [active, holeScale, blastScale, blastOpacity, onFinish]);

  // make circle big enough to cover diagonal
  const size = Math.hypot(width, height) * 1.2;

  return (
    <View style={styles.overlay}>
      {/* primary-color “black hole” */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: COLORS.primary,
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: holeScale }],
          },
        ]}
      />

      {/* white blast */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: COLORS.secondary,
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: blastScale }],
            opacity: blastOpacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  circle: {
    position: 'absolute',
  },
});
