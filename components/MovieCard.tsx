import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useRef } from 'react';

export default function MovieCard({
  movie,
  isFavorite,
  onToggleFavorite,
  onPressDetails,
}: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastTap = useRef<number>(0);

  const triggerFavoriteAnimation = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      // Double tap detected
      onToggleFavorite();
      triggerFavoriteAnimation();
    }
    lastTap.current = now;
  };

  const handleFavoritePress = () => {
    onToggleFavorite();
    triggerFavoriteAnimation();
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <Pressable
        style={({ hovered }) => [styles.card, hovered && styles.cardHovered]}
        onPress={onPressDetails}
      >
        <Image source={{ uri: movie.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text numberOfLines={3} style={styles.description}>
            {movie.description}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.button}
            >
              <Animated.Text
                style={[
                  styles.favoriteText,
                  {
                    transform: [{ scale: scaleAnim }],
                    color: isFavorite ? 'red' : 'gray',
                  },
                ]}
              >
                {isFavorite ? '♥ Favorited' : '♡ Favorite'}
              </Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressDetails} style={styles.button}>
              <Text style={{ color: '#007bff' }}>Details →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHovered: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.3,
  },
  image: {
    width: 120,
    height: 180,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#555', marginVertical: 8 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  favoriteText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
