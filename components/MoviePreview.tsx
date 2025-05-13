// components/MoviePreview.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import { useRouter } from 'expo-router';

export default function MoviePreview({ movie }: { movie: any }) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push(`/movie/${movie.id}`)}>
      <View style={styles.card}>
        {movie.poster_path ? (
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
            }}
            style={styles.poster}
          />
        ) : (
          <View style={[styles.poster, styles.noImage]}>
            <Text>No Image</Text>
          </View>
        )}
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.sub}>
          ⭐ {movie.vote_average} 📅 {movie.release_date}
        </Text>
        <Text style={styles.overview} numberOfLines={4}>
          {movie.overview}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  noImage: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.h2,
    color: COLORS.primary,
    textAlign: 'center',
  },
  sub: {
    fontSize: FONTS.body,
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  overview: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
});
