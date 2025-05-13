// screens/FormPage.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import axios from 'axios';
import AccordionSection from '@/components/AccordionSection';
import GenreTile from '@/components/GenreTile';
import LoadAnimation from '@/components/LoadAnimation';
import MoviePreview from '@/components/MoviePreview';
import { COLORS, SPACING, FONTS } from '@/theme';
import { API_KEY, OPEN_AI_API_KEY } from '@/constants/app';
import { useRouter } from 'expo-router';

export default function FormPage() {
  const [form, setForm] = useState({
    movie: '',
    genre: '',
    mood: '',
    actor: '',
    language: '',
  });
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnim, setShowAnim] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const router = useRouter();

  const genres = [
    'Action',
    'Comedy',
    'Documentary',
    'Family',
    'History',
    'Horror',
    'Mystery',
    'Romance',
    'Thriller',
    'Biography',
    'Sport',
  ];

  const fetchRecommendation = async () => {
    if (!form.movie && !selectedGenre) {
      return Alert.alert('Please enter a movie or pick a genre');
    }
    setLoading(true);
    setShowAnim(true);

    try {
      // 1) Ask OpenAI
      const prompt = `Recommend a movie based on:
- Favorite Movie: ${form.movie}
- Favorite Genre: ${selectedGenre}
- Mood: ${form.mood}
- Favorite Actor: ${form.actor}
- Preferred Language: ${form.language}
Give only the movie title.`;
      const openaiRes = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        },
        { headers: { Authorization: `Bearer ${OPEN_AI_API_KEY}` } },
      );
      const title = openaiRes.data.choices[0].message.content.trim();

      // 2) Lookup that movie on TMDB
      const tmdbRes = await axios.get(
        `https://api.themoviedb.org/3/search/movie`,
        { params: { api_key: API_KEY, query: title } },
      );
      const movie = tmdbRes.data.results[0];
      setRecommendation(movie);

      // 3) Fetch similar movies
      if (movie?.id) {
        const recRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/recommendations`,
          { params: { api_key: API_KEY, language: 'en-US', page: 1 } },
        );
        setSimilarMovies(recRes.data.results.slice(0, 10));
      }

      // 4) Collapse accordions
      setProfileOpen(false);
      setGenreOpen(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to fetch recommendation');
      setLoading(false);
      setShowAnim(false);
    }
  };

  const onAnimFinish = () => {
    setShowAnim(false);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.containerWrapper}>
        <ScrollView contentContainerStyle={styles.container}>
          <AccordionSection
            title="Your Profile"
            expanded={profileOpen}
            onToggle={() => setProfileOpen(!profileOpen)}
          >
            <TextInput
              placeholder="Favorite Movie"
              style={styles.input}
              value={form.movie}
              onChangeText={(t) => setForm((f) => ({ ...f, movie: t }))}
            />
            <TextInput
              placeholder="Mood Right Now"
              style={styles.input}
              value={form.mood}
              onChangeText={(t) => setForm((f) => ({ ...f, mood: t }))}
            />
            <TextInput
              placeholder="Favorite Actor"
              style={styles.input}
              value={form.actor}
              onChangeText={(t) => setForm((f) => ({ ...f, actor: t }))}
            />
            <TextInput
              placeholder="Preferred Language"
              style={styles.input}
              value={form.language}
              onChangeText={(t) => setForm((f) => ({ ...f, language: t }))}
            />
          </AccordionSection>

          <AccordionSection
            title="Pick a Genre"
            expanded={genreOpen}
            onToggle={() => setGenreOpen(!genreOpen)}
          >
            <View style={styles.tileRow}>
              {genres.map((g) => (
                <GenreTile
                  key={g}
                  genre={g}
                  selected={g === selectedGenre}
                  onPress={() => {
                    setSelectedGenre(g);
                    setForm((f) => ({ ...f, genre: g }));
                  }}
                />
              ))}
            </View>
          </AccordionSection>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Loading…' : 'Get Recommendation'}
              onPress={fetchRecommendation}
              disabled={loading}
              color={COLORS.primary}
            />
          </View>

          {recommendation && (
            <>
              <MoviePreview movie={recommendation} />

              {similarMovies.length > 0 && (
                <View style={styles.similarContainer}>
                  <Text style={styles.similarTitle}>More like this</Text>
                  <FlatList
                    data={similarMovies}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.similarCard}
                        onPress={() => {
                          router.push(`/movie/${item.id}`);
                        }}
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
            </>
          )}
        </ScrollView>
        {showAnim && <LoadAnimation active={loading} onFinish={onAnimFinish} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: SPACING.sm,
    fontSize: FONTS.body,
    paddingVertical: SPACING.sm,
  },
  tileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonContainer: {
    marginVertical: SPACING.md,
  },
  similarContainer: {
    marginTop: SPACING.lg,
  },
  similarTitle: {
    fontSize: FONTS.h2,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  similarCard: {
    marginRight: SPACING.md,
    width: 100,
    alignItems: 'center',
  },
  similarPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  similarText: {
    marginTop: SPACING.xs,
    fontSize: FONTS.body,
    color: COLORS.text,
    textAlign: 'center',
  },
  noImage: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
  },
  containerWrapper: {
    flex: 1,
    position: 'relative', // <-- makes absolute children fill this
  },
});
