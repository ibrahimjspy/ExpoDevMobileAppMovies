import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import axios from 'axios';
import { API_KEY, OPEN_AI_API_KEY } from '@/constants/app';
import { useRouter } from 'expo-router';

const FormPage = () => {
  const [formData, setFormData] = useState({
    movie: '',
    genre: '',
    mood: '',
    actor: '',
    language: 'Any',
  });

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const router = useRouter();
  const [genreSuggestions] = useState([
    'Action',
    'Adventure',
    'Animation',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'History',
    'Horror',
    'Music',
    'Mystery',
    'Romance',
    'Science Fiction',
    'TV Movie',
    'Thriller',
    'War',
    'Western',
  ]);

  const [languageSuggestions] = useState([
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Spanish', value: 'es' },
    { label: 'Korean', value: 'ko' },
    { label: 'Japanese', value: 'ja' },
  ]);

  const [filteredGenres, setFilteredGenres] = useState<string[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState<
    typeof languageSuggestions
  >([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const getRecommendation = async () => {
    setLoading(true);
    setRecommendation(null);
    setSimilarMovies([]);
    fadeAnim.setValue(0); // Reset animation

    try {
      const prompt = `Recommend a movie based on:
- Favorite Movie: ${formData.movie}
- Favorite Genre: ${formData.genre}
- Mood: ${formData.mood}
- Favorite Actor: ${formData.actor}
- Preferred Language: ${formData.language}
Give only the movie title.`;

      const openaiRes = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${OPEN_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const recommendedTitle = openaiRes.data.choices[0].message.content.trim();

      const tmdbRes = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(recommendedTitle)}`,
      );

      const mainMovie = tmdbRes.data.results[0];
      setRecommendation(mainMovie);

      if (mainMovie?.genre_ids?.length > 0) {
        const genreId = mainMovie.genre_ids[0];
        const similarRes = await axios.get(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`,
        );
        setSimilarMovies(similarRes.data.results.slice(0, 20));
      }

      // Start animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Recommendation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎬 Personalized Movie Picker</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Favorite Movie"
          style={styles.input}
          onChangeText={(text) => handleChange('movie', text)}
        />
        <TextInput
          placeholder="Genre"
          style={styles.input}
          onChangeText={(text) => handleChange('genre', text)}
        />

        <TextInput
          placeholder="Mood Right Now"
          style={styles.input}
          onChangeText={(text) => handleChange('mood', text)}
        />
        <TextInput
          placeholder="Favorite Actor"
          style={styles.input}
          onChangeText={(text) => handleChange('actor', text)}
        />

        <TextInput
          placeholder="Language"
          style={styles.input}
          onChangeText={(text) => handleChange('actor', text)}
        />

        <TouchableOpacity style={styles.button} onPress={getRecommendation}>
          <Text style={styles.buttonText}>🎥 Recommend a Movie</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#9b59b6"
          style={{ marginTop: 20 }}
        />
      )}

      {recommendation && (
        <TouchableOpacity
          onPress={() => router.push(`/movie/${recommendation.id}`)}
        >
          <Animated.View style={{ ...styles.result, opacity: fadeAnim }}>
            <Text style={styles.movieTitle}>{recommendation.title}</Text>
            {recommendation.poster_path && (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${recommendation.poster_path}`,
                }}
                style={styles.poster}
              />
            )}
            <Text style={styles.details}>
              Rating: {recommendation.vote_average}/10
            </Text>
            <Text style={styles.details}>
              Release Date: {recommendation.release_date}
            </Text>
            <Text style={styles.details}>
              Overview: {recommendation.overview}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      )}

      {similarMovies.length > 0 && (
        <View style={styles.similarContainer}>
          <Text style={styles.similarTitle}>You may also like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {similarMovies.map((movie) => (
              <TouchableOpacity
                key={movie.id}
                style={styles.similarCard}
                onPress={() => router.push(`/movie/${movie.id}`)}
              >
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
                  }}
                  style={styles.similarPoster}
                />
                <Text style={styles.similarText}>{movie.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'lavender',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6a0dad',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#b39ddb',
    marginBottom: 15,
    fontSize: 16,
    padding: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#b39ddb',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 15,
    backgroundColor: '#f8f4ff',
  },
  suggestionList: {
    maxHeight: 100,
    backgroundColor: '#fff',
    borderColor: '#b39ddb',
    borderWidth: 1,
    borderRadius: 6,
  },
  suggestion: {
    padding: 10,
    fontSize: 16,
    color: '#6a0dad',
  },
  button: {
    backgroundColor: '#d1c4e9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#4a148c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  result: {
    marginTop: 30,
    backgroundColor: '#f3e5f5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6a0dad',
    marginBottom: 10,
    textAlign: 'center',
  },
  poster: {
    width: 200,
    height: 300,
    borderRadius: 10,
    marginVertical: 10,
  },
  details: {
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 2,
    color: '#4a148c',
  },
  similarContainer: {
    marginTop: 20,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6a0dad',
    marginBottom: 10,
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
  },
  similarText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 5,
    color: '#4a148c',
  },
});

export default FormPage;
