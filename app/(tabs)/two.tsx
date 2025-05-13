// app/(tabs)/all-movies.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import MovieCard from '../../components/MovieCard';
import { API_KEY } from '@/constants/app';
import { useRouter } from 'expo-router';
import { COLORS } from '@/theme';

export default function AllMoviesScreen() {
  const [movies, setMovies] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  const router = useRouter();

  const toggleFavorite = (movieId: any) => {
    setFavorites((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId],
    );
  };

  const fetchGenres = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`,
      );
      const json = await res.json();
      setGenres(json.genres);
    } catch (err) {
      console.error('Failed to load genres', err);
    }
  };

  const fetchMovies = async (pageNumber = 1) => {
    try {
      setLoading(true);
      let url = '';

      if (searchQuery.trim()) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          searchQuery,
        )}&page=${pageNumber}`;
      } else {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${pageNumber}`;
        if (selectedGenre) url += `&with_genres=${selectedGenre}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.results.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) =>
          pageNumber === 1 ? json.results : [...prev, ...json.results],
        );
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMovies(page);
  }, [page]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchMovies(1);
  }, [debouncedQuery, selectedGenre]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (error) return <Text style={styles.centered}>{error}</Text>;

  return (
    <View style={styles.background}>
      {/* Search & Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search movies..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Genre Filters */}
      {showFilters && !loading && (
        <ScrollView horizontal style={styles.genreFilterContainer}>
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.genreButton,
                selectedGenre === genre.id && styles.genreButtonActive,
              ]}
              onPress={() =>
                setSelectedGenre(selectedGenre === genre.id ? null : genre.id)
              }
            >
              <Text
                style={[
                  styles.genreText,
                  selectedGenre === genre.id && { color: '#fff' },
                ]}
              >
                {genre.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading && movies.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color="#000"
            style={styles.inlineLoader}
          />
        </View>
      )}

      {!loading && (
        <ScrollView contentContainerStyle={styles.container}>
          {movies.map((movie, idx) => (
            <Animated.View key={movie.id} entering={FadeInUp.delay(idx * 30)}>
              <MovieCard
                movie={{
                  id: movie.id,
                  title: movie.title,
                  description: movie.overview,
                  image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }}
                isFavorite={favorites.includes(movie.id)}
                onToggleFavorite={() => toggleFavorite(movie.id)}
                onPressDetails={() => router.push(`/movie/${movie.id}`)}
              />
            </Animated.View>
          ))}

          {/* Load More */}
          {hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={loading}
            >
              <Text style={styles.loadMoreText}>
                {loading ? 'Loading...' : 'Load More'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.endText}>No more movies to load.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#e6ecf0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: '#888',
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  genreFilterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    zIndex: 100,
    height: 200,
  },
  genreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
  },
  genreButtonActive: {
    backgroundColor: COLORS.primary,
  },
  genreText: {
    color: '#000',
  },
  container: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  loadMoreButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 15,
    fontSize: 14,
  },
  inlineLoader: {
    marginVertical: 20,
  },
});
