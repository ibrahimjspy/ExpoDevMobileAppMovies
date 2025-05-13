// components/GenreTile.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../theme';

export default function GenreTile({
  genre,
  selected,
  onPress,
}: {
  genre: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tile, selected && { backgroundColor: COLORS.primary }]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && { color: '#fff' }]}>{genre}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    margin: SPACING.xs,
  },
  text: {
    fontSize: FONTS.body,
    color: COLORS.primary,
  },
});
