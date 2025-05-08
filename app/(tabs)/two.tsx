import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MovieCard from '../../components/MovieCard';
import { API_KEY } from '@/constants/app';
import { useRouter } from 'expo-router';

export default function AllMoviesScreen() {
  const [movies, setMovies] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
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
    fetchMovies(page);
  }, [debouncedQuery, selectedGenre]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && movies.length === 0)
    return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.centered}>{error}</Text>;

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Search and Filter */}
        <View style={styles.searchFilterContainer}>
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

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Genre Filters */}
        {showFilters && (
          <ScrollView
            horizontal
            contentContainerStyle={styles.genreFilterContainer}
          >
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={[
                  styles.genreButton,
                  selectedGenre === genre.id && styles.genreButtonActive,
                ]}
                onPress={() => {
                  setSelectedGenre(
                    selectedGenre === genre.id ? null : genre.id,
                  );
                }}
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

        {/* Movie Cards */}
        {movies.map((movie: any) => (
          <MovieCard
            key={movie.id}
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
        ))}

        {/* Load More or End */}
        {hasMore ? (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>
              {loading ? 'Loading...' : 'Load More'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.endText}>No more movies to load.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#e6ecf0',
  },
  container: {
    padding: 10,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  genreFilterContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  genreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
  },
  genreButtonActive: {
    backgroundColor: '#007bff',
  },
  genreText: {
    color: '#000',
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
  clearButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: '#888',
  },
});
