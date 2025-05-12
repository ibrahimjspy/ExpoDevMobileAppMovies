import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  FlatList,
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_KEY, OPEN_AI_API_KEY } from '@/constants/app';
import { useRouter } from 'expo-router';

const initialFormData = {
  movie: '',
  genre: '',
  mood: '',
  actor: '',
  language: '',
};

export default function FormPage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState(initialFormData);
  const [filteredGenres, setFilteredGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);

  const handleChange = (key: string, value: string) =>
    setFormData({ ...formData, [key]: value });

  const getRecommendation = async () => {
    setLoading(true);
    setRecommendation(null);
    setSimilarMovies([]);
    fadeAnim.setValue(0);

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
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          recommendedTitle,
        )}`,
      );

      const mainMovie = tmdbRes.data.results[0];
      setRecommendation(mainMovie);

      if (mainMovie?.genre_ids?.length) {
        const recRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${mainMovie.id}/recommendations`,
          { params: { api_key: API_KEY, language: 'en-US', page: 1 } },
        );
        setSimilarMovies(recRes.data.results.slice(0, 20));
      }

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

  const handleReset = () => {
    setFormData(initialFormData);
    setRecommendation(null);
    setSimilarMovies([]);
  };

  const handleRetry = () => getRecommendation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>🎬 Personalized Movie Picker</Text>

          {/* FORM */}
          {!recommendation && (
            <View style={styles.form}>
              <TextInput
                placeholder="Favorite Movie"
                style={styles.input}
                value={formData.movie}
                onChangeText={(text) => handleChange('movie', text)}
              />

              <TextInput
                placeholder="Genre"
                style={styles.input}
                value={formData.genre}
                onChangeText={(text) => handleChange('genre', text)}
              />

              <TextInput
                placeholder="Mood Right Now"
                style={styles.input}
                value={formData.mood}
                onChangeText={(text) => handleChange('mood', text)}
              />

              <TextInput
                placeholder="Favorite Actor"
                style={styles.input}
                value={formData.actor}
                onChangeText={(text) => handleChange('actor', text)}
              />

              <TextInput
                placeholder="Preferred Language"
                style={styles.input}
                value={formData.language}
                onChangeText={(text) => handleChange('language', text)}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={getRecommendation}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Loading…' : '🎥 Recommend'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={handleReset}
                >
                  <Text style={[styles.buttonText, styles.resetText]}>
                    🗑 Reset
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* LOADING */}
          {loading && (
            <ActivityIndicator
              size="large"
              color="#9b59b6"
              style={styles.loader}
            />
          )}

          {/* RESULT */}
          {recommendation && (
            <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
              <View style={styles.resultHeader}>
                <Text style={styles.movieTitle}>{recommendation.title}</Text>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.smallButton}>Reset</Text>
                </TouchableOpacity>
              </View>

              {recommendation.poster_path ? (
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w500${recommendation.poster_path}`,
                  }}
                  style={styles.poster}
                />
              ) : (
                <View style={[styles.poster, styles.noImage]}>
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}

              <Text style={styles.details}>
                ⭐ Rating: {recommendation.vote_average}/10
              </Text>
              <Text style={styles.details}>
                📅 Release: {recommendation.release_date}
              </Text>
              <Text style={styles.details} numberOfLines={5}>
                📝 {recommendation.overview}
              </Text>

              <TouchableOpacity
                style={styles.smallButtonContainer}
                onPress={handleRetry}
                disabled={loading}
              >
                <Text style={styles.smallButton}>
                  {loading ? 'Retrying…' : '↻ Retry'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* SIMILAR */}
          {similarMovies.length > 0 && (
            <View style={styles.similarContainer}>
              <Text style={styles.similarTitle}>You may also like</Text>
              <FlatList
                horizontal
                data={similarMovies}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.similarCard}
                    onPress={() => router.push(`/movie/${item.id}`)}
                  >
                    {item.poster_path ? (
                      <Image
                        source={{
                          uri: `https://image.tmdb.org/t/p/w200${item.poster_path}`,
                        }}
                        style={styles.similarPoster}
                      />
                    ) : (
                      <View style={[styles.similarPoster, styles.noImage]}>
                        <Text style={styles.noImageText}>No Image</Text>
                      </View>
                    )}
                    <Text style={styles.similarText} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'lavender' },
  flex: { flex: 1 },
  container: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6a0dad',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#b39ddb',
    marginBottom: 15,
    fontSize: 16,
    paddingVertical: 8,
  },
  autocompleteContainer: {
    marginBottom: 15,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#b39ddb',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f8f4ff',
  },
  suggestionList: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#b39ddb',
    borderWidth: 1,
    borderRadius: 6,
    zIndex: 1,
  },
  suggestion: {
    padding: 10,
    fontSize: 16,
    color: '#6a0dad',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#b39ddb',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f8f4ff',
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#d1c4e9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#e0e0e0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#4a148c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetText: {
    color: '#555',
  },
  loader: {
    marginTop: 30,
  },
  resultCard: {
    marginTop: 30,
    backgroundColor: '#f3e5f5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6a0dad',
    flex: 1,
    flexWrap: 'wrap',
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
  smallButtonContainer: {
    marginTop: 10,
  },
  smallButton: {
    fontSize: 14,
    color: '#6a0dad',
    fontWeight: '600',
  },
  similarContainer: { marginTop: 20 },
  similarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6a0dad',
    marginBottom: 10,
  },
  similarCard: {
    marginRight: 12,
    alignItems: 'center',
    width: 100,
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
  noImage: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
  },
});
