import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { DiaryEntry } from '../types';
import storage from '../storage';

interface Props {
  onSelectEntry: (entry: DiaryEntry) => void;
}

const SearchScreen: React.FC<Props> = ({ onSelectEntry }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<DiaryEntry[]>([]);
  const [searching, setSearching] = useState(false);

  const performSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      const searchResults = await storage.searchEntries(searchKeyword.trim());
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('错误', '搜索失败');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = () => {
    performSearch(keyword);
  };

  const handleClear = () => {
    setKeyword('');
    setResults([]);
  };

  const renderResultItem = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onSelectEntry(item)}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultDate}>{item.date}</Text>
        <Text style={styles.resultCity}>{item.city}</Text>
      </View>
      <Text style={styles.resultContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.resultFooter}>
        <Text style={styles.resultWeather}>
          {item.weather.temperature}°C {item.weather.description}
        </Text>
        {item.images.length > 0 && (
          <Text style={styles.resultMedia}>📷 {item.images.length}</Text>
        )}
        {item.videos.length > 0 && (
          <Text style={styles.resultMedia}>🎬 {item.videos.length}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索日记内容或城市..."
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[styles.searchButton, keyword.trim() ? styles.searchButtonActive : styles.searchButtonInactive]}
          onPress={handleSearch}
          disabled={!keyword.trim() || searching}
        >
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
        {keyword.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {searching && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      )}

      {!searching && results.length === 0 && keyword.trim() && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到相关日记</Text>
        </View>
      )}

      {!searching && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.date}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!keyword.trim() && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>输入关键词搜索日记内容或城市</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    marginLeft: 10,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonActive: {
    backgroundColor: '#4A90E2',
  },
  searchButtonInactive: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  hintContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    padding: 15,
  },
  resultItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultCity: {
    fontSize: 14,
    color: '#4A90E2',
  },
  resultContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultWeather: {
    fontSize: 12,
    color: '#4A90E2',
  },
  resultMedia: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
});

export default SearchScreen;