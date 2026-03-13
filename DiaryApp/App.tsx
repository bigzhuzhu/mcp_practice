/*
 * @Author: bigzhuzhu 1327838903@qq.com
 * @Date: 2026-03-13 15:59:07
 * @LastEditors: bigzhuzhu 1327838903@qq.com
 * @LastEditTime: 2026-03-13 16:34:25
 * @FilePath: \python_ai\DiaryApp\App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Navigation from './src/navigation';
import storage from './src/storage';

export default function App() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await storage.init();
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setInitializing(false);
      }
    };

    initApp();
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Navigation onInit={() => {}} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});