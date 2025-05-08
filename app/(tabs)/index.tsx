import { useState } from 'react';
import { StyleSheet, Platform, LayoutAnimation, UIManager, Pressable, View as RNView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from '@/components/Themed';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function TabOneScreen() {
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const onChange = (_event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios'); // iOS keeps picker open
    setDate(currentDate);
  };

  return (
    <LinearGradient colors={['#ffe0f0', '#fff']} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Tab One Ibrahim</Text>

        <View style={styles.accordionContainer}>
          <Pressable onPress={toggleAccordion} style={styles.accordionHeader}>
            <Text style={styles.accordionHeaderText}>
              {expanded ? 'Hide Date Picker' : 'Show Date Picker'}
            </Text>
          </Pressable>

          {expanded && (
            <RNView style={styles.accordionContent}>
              <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
                <Text style={styles.dateButtonText}>Pick a Date</Text>
              </Pressable>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChange}
                />
              )}

              <Text style={styles.selectedDate}>
                Selected Date: {date.toDateString()}
              </Text>
            </RNView>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b30059',
    textAlign: 'center',
    marginBottom: 30,
  },
  accordionContainer: {
    backgroundColor: '#ffffffdd',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  accordionHeader: {
    backgroundColor: '#ffc0cb',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  accordionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#660033',
  },
  accordionContent: {
    padding: 20,
    backgroundColor: '#fff0f5',
  },
  dateButton: {
    backgroundColor: '#ffb6c1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#660033',
    fontWeight: '600',
    fontSize: 16,
  },
  selectedDate: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#660033',
  },
});
