import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { API_KEY } from '@/constants/app';

const screenWidth = Dimensions.get('window').width;

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
  Default: '#607d8b',
};

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false }); // hide top bar
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=similar`,
        );
        const json = await res.json();
        setMovie(json);
        setSimilarMovies(json.similar?.results || []);
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.bannerContainer]}>
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }}
          style={styles.banner}
        />
        <View style={styles.overlay}>
          <Text style={styles.bannerTitle}>{movie.title}</Text>
          {movie.tagline ? (
            <Text style={styles.tagline}>"{movie.tagline}"</Text>
          ) : null}
        </View>
      </View>

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
          Budget: ${movie.budget?.toLocaleString() || 'N/A'}
        </Text>
        <Text style={styles.detail}>
          Revenue: ${movie.revenue?.toLocaleString() || 'N/A'}
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

      {similarMovies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Movies</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {similarMovies.map((sim) => (
              <TouchableOpacity
                key={sim.id}
                onPress={() => router.push(`/movie/${sim.id}`)}
              >
                <View key={sim.id} style={styles.similarCard}>
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w200${sim.poster_path}`,
                    }}
                    style={styles.similarPoster}
                  />
                  <Text style={styles.similarText} numberOfLines={2}>
                    {sim.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>

        <View style={styles.navColumn}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>🏠 Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/two')}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>🎬 Go to Tab 2</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 30, backgroundColor: '#fdf6ff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    width: screenWidth,
    height: screenWidth * 0.9,
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 10,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#eee',
    marginTop: 4,
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
    color: '#4a148c',
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
  similarCard: {
    marginRight: 12,
    alignItems: 'center',
    width: 120,
  },
  similarPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 6,
  },
  similarText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  navColumn: {
    flexDirection: 'row',
    alignItems: 'center', // centers horizontally
    width: '100%', // makes sure children don't wrap
  },

  navButton: {
    backgroundColor: '#d1c4e9',
    padding: 12,
    marginRight: '2%',
    borderRadius: 8,
    alignItems: 'center',
    width: '49%', // adjust to control button width
    marginBottom: 12, // spacing between buttons
  },

  navButtonText: {
    color: '#4a148c',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
