import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { API_KEY } from '@/constants/app';

const genreColors = {
  Action: '#ff4c4c',
  Comedy: '#ffc107',
  Drama: '#4caf50',
  Horror: '#9c27b0',
  Romance: '#e91e63',
  Adventure: '#03a9f4',
  Animation: '#ff9800',
  Fantasy: '#673ab7',
  Thriller: '#607d8b',
  // fallback color
  Default: '#607d8b',
};

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`,
        );
        const json = await res.json();
        setMovie(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (loading)
    return <ActivityIndicator size="large" style={styles.centered} />;

  if (!movie) return <Text style={styles.centered}>Movie not found.</Text>;

  const primaryGenre = movie.genres?.[0]?.name || 'Default';
  const themeColor = genreColors[primaryGenre] || genreColors.Default;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: 'orange' }]}
    >
      <Animated.View
        entering={FadeInUp.duration(500)}
        style={[styles.header, { backgroundColor: themeColor }]}
      >
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }}
          style={styles.image}
        />
        <Text style={styles.title}>{movie.title}</Text>
        {movie.tagline ? (
          <Text style={styles.tagline}>"{movie.tagline}"</Text>
        ) : null}
      </Animated.View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.text}>
          {movie.overview || 'No overview available.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.detail}>Release Date: {movie.release_date}</Text>
        <Text style={styles.detail}>Runtime: {movie.runtime} min</Text>
        <Text style={styles.detail}>Status: {movie.status}</Text>
        <Text style={styles.detail}>
          Rating: {movie.vote_average} / 10 ({movie.vote_count} votes)
        </Text>
        <Text style={styles.detail}>
          Budget: ${movie.budget.toLocaleString()}
        </Text>
        <Text style={styles.detail}>
          Revenue: ${movie.revenue.toLocaleString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genres</Text>
        <View style={styles.genreContainer}>
          {movie.genres.map((genre) => (
            <View
              key={genre.id}
              style={[styles.genreBadge, { backgroundColor: themeColor }]}
            >
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 30, backgroundColor: 'red' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  image: {
    width: '50%',
    height: 200,
    borderRadius: 12,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  detail: {
    fontSize: 15,
    color: '#555',
    marginVertical: 2,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#fff',
    fontSize: 14,
  },
});
