import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { DiaryEntry } from '../types';
import storage from '../storage';

interface Props {
  onSelectDate: (date: string, entry: DiaryEntry | null) => void;
}

const CalendarView: React.FC<Props> = ({ onSelectDate }) => {
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const allEntries = await storage.getAllEntries();
      setEntries(allEntries);
      
      const marks: { [key: string]: any } = {};
      allEntries.forEach(entry => {
        marks[entry.date] = {
          marked: true,
          selected: false,
          selectedColor: '#4A90E2',
        };
      });
      setMarkedDates(marks);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const handleDayPress = async (day: any) => {
    const date = day.dateString;
    try {
      const entry = await storage.getEntryByDate(date);
      onSelectDate(date, entry);
    } catch (error) {
      console.error('Failed to load entry:', error);
    }
  };

  const getMonthStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    return monthEntries.length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的日记</Text>
        <Text style={styles.subtitle}>本月已写 {getMonthStats()} 篇</Text>
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#4A90E2',
          selectedDayBackgroundColor: '#4A90E2',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#4A90E2',
          monthTextColor: '#333',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4A90E2' }]} />
          <Text style={styles.legendText}>有日记</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  calendar: {
    borderRadius: 10,
    marginHorizontal: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default CalendarView;