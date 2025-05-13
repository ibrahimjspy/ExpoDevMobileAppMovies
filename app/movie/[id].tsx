// app/movie/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, FONTS } from '@/theme';
import { API_KEY } from '@/constants/app';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_H = SCREEN_W * 0.6;

const genreColors: Record<string, string> = {
  Action: '#ff4c4c',
  Comedy: '#ffc107',
  Drama: '#4caf50',
  Horror: '#9c27b0',
  Romance: '#e91e63',
  Adventure: '#03a9f4',
  Animation: '#ff9800',
  Fantasy: '#673ab7',
  Thriller: '#607d8b',
  Default: '#607d8b',
};

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}` +
            `?api_key=${API_KEY}&append_to_response=similar`,
        );
        const data = await res.json();
        setMovie(data);
        setSimilar(data.similar?.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  if (!movie) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: COLORS.text }}>Movie not found.</Text>
      </View>
    );
  }

  const primaryGenre = movie.genres?.[0]?.name || 'Default';
  const themeColor = genreColors[primaryGenre] || genreColors.Default;

  return (
    <ScrollView style={styles.screen}>
      {/* Banner + Gradient */}
      <View style={styles.bannerWrapper}>
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`,
          }}
          style={styles.banner}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>{movie.title}</Text>
          {movie.tagline ? (
            <Text style={styles.tagline}>"{movie.tagline}"</Text>
          ) : null}
        </View>
      </View>

      {/* Overview Card */}
      <Animated.View entering={FadeInUp.delay(100)} style={[styles.card]}>
        <Text style={styles.cardTitle}>Overview</Text>
        <Text style={styles.cardText}>
          {movie.overview || 'No overview available.'}
        </Text>
      </Animated.View>

      {/* Details Card */}
      <Animated.View entering={FadeInUp.delay(200)} style={[styles.card]}>
        <Text style={styles.cardTitle}>Details</Text>
        {[
          `Release Date: ${movie.release_date}`,
          `Runtime: ${movie.runtime} min`,
          `Status: ${movie.status}`,
          `Rating: ${movie.vote_average} / 10`,
          `Budget: $${movie.budget?.toLocaleString() || 'N/A'}`,
          `Revenue: $${movie.revenue?.toLocaleString() || 'N/A'}`,
        ].map((line) => (
          <Text key={line} style={styles.detailText}>
            {line}
          </Text>
        ))}
      </Animated.View>

      {/* Genres */}
      <Animated.View entering={FadeInUp.delay(300)} style={[styles.card]}>
        <Text style={styles.cardTitle}>Genres</Text>
        <View style={styles.genreRow}>
          {movie.genres.map((g: any) => (
            <View
              key={g.id}
              style={[styles.genreBadge, { backgroundColor: themeColor }]}
            >
              <Text style={styles.genreText}>{g.name}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Similar Movies */}
      {similar.length > 0 && (
        <Animated.View entering={FadeInUp.delay(400)} style={[styles.card]}>
          <Text style={styles.cardTitle}>Similar Movies</Text>
          <FlatList
            data={similar}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.similarList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.similarCard}
                onPress={() => router.push(`/movie/${item.id}`)}
              >
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w185${item.poster_path}`,
                  }}
                  style={styles.similarImage}
                  resizeMode="cover"
                />
                <Text style={styles.similarTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  bannerWrapper: {
    width: '100%',
    height: BANNER_H,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerText: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
  },
  title: {
    fontSize: FONTS.h1,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    fontSize: FONTS.body,
    fontStyle: 'italic',
    color: '#eee',
    marginTop: SPACING.xs,
  },

  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // Android shadow
    elevation: 3,
  },
  cardTitle: {
    fontSize: FONTS.h2,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  cardText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  detailText: {
    fontSize: FONTS.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  genreText: {
    color: '#fff',
    fontSize: FONTS.body,
  },

  similarList: {
    paddingVertical: SPACING.sm,
  },
  similarCard: {
    width: 100,
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  similarImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  similarTitle: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
