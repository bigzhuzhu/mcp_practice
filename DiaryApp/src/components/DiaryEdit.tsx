import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { DiaryEntry, LocationInfo } from '../types';
import { getWeatherByCoordinates } from '../weatherService';
import * as Location from 'expo-location';

interface Props {
  entry: DiaryEntry | null;
  onSave: (entry: DiaryEntry) => void;
  onCancel: () => void;
}

const DiaryEdit: React.FC<Props> = ({ entry, onSave, onCancel }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState({
    temperature: 0,
    description: '',
    icon: '',
  });
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [date] = useState(entry?.date || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
      setImages(entry.images);
      setVideos(entry.videos);
      setCity(entry.city);
      setWeather(entry.weather);
    } else {
      getCurrentLocationAndWeather();
    }
  }, [entry]);

  const getCurrentLocationAndWeather = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限拒绝', '需要位置权限来获取天气信息');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const locationInfo: LocationInfo = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        city: '',
        country: '',
      };
      setLocation(locationInfo);

      const weatherData = await getWeatherByCoordinates(
        loc.coords.latitude,
        loc.coords.longitude
      );
      setWeather({
        temperature: weatherData.temperature,
        description: weatherData.description,
        icon: weatherData.icon,
      });
      setCity(weatherData.city);
    } catch (error) {
      console.error('Failed to get location/weather:', error);
      Alert.alert('错误', '无法获取位置或天气信息');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('错误', '无法选择图片');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('错误', '无法拍照');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setVideos([...videos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Failed to pick video:', error);
      Alert.alert('错误', '无法选择视频');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入日记内容');
      return;
    }

    const newEntry: DiaryEntry = {
      id: entry?.id || Date.now(),
      date,
      content: content.trim(),
      images,
      videos,
      city: city || '未知城市',
      weather: {
        temperature: weather.temperature,
        description: weather.description,
        icon: weather.icon,
      },
      createdAt: entry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newEntry);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      <View style={styles.weatherContainer}>
        <Text style={styles.weatherText}>
          {city} {weather.temperature}°C {weather.description}
        </Text>
      </View>

      <TextInput
        style={styles.contentInput}
        multiline
        placeholder="写下今天的故事..."
        value={content}
        onChangeText={setContent}
        textAlignVertical="top"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>图片</Text>
        <View style={styles.mediaContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.mediaItem}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={pickImage}>
            <Text style={styles.addText}>+ 图片</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={takePhoto}>
            <Text style={styles.addText}>📷 拍照</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>视频</Text>
        <View style={styles.mediaContainer}>
          {videos.map((uri, index) => (
            <View key={index} style={styles.mediaItem}>
              <Text style={styles.videoText}>🎬 视频 {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeVideo(index)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={pickVideo}>
            <Text style={styles.addText}>+ 视频</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  dateContainer: {
    marginBottom: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherContainer: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  weatherText: {
    fontSize: 14,
    color: '#4A90E2',
  },
  contentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 200,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mediaItem: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  videoText: {
    width: 100,
    height: 100,
    lineHeight: 100,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    color: '#666',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  addText: {
    color: '#999',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DiaryEdit;