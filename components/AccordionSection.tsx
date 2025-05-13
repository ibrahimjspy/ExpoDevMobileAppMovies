// components/AccordionSection.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../theme';

type Props = {
  title: string;
  children: React.ReactNode;
  expanded?: boolean; // new
  onToggle?: () => void; // new
};

export default function AccordionSection({
  title,
  children,
  expanded: controlledExpanded,
  onToggle,
}: Props) {
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = isControlled ? controlledExpanded! : internalExpanded;

  const anim = useState(() => new Animated.Value(0))[0];

  // whenever `expanded` changes, animate
  useEffect(() => {
    Animated.timing(anim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, anim]);

  const toggle = () => {
    if (onToggle) onToggle();
    if (!isControlled) setInternalExpanded((v) => !v);
  };

  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // max height
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle}>
        <Text style={styles.title}>
          {title} {expanded ? '–' : '+'}
        </Text>
      </TouchableOpacity>
      {expanded && (
        <Animated.View style={[styles.content, { height }]}>
          {expanded && children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  title: {
    fontSize: FONTS.h2,
    color: COLORS.primary,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  content: {
    overflow: 'hidden',
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
});
