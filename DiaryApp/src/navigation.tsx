/*
 * @Author: bigzhuzhu 1327838903@qq.com
 * @Date: 2026-03-13 16:33:26
 * @LastEditors: bigzhuzhu 1327838903@qq.com
 * @LastEditTime: 2026-03-13 16:33:34
 * @FilePath: \python_ai\DiaryApp\src\navigation.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DiaryEntry } from './types';
import CalendarView from './components/CalendarView';
import DiaryEdit from './components/DiaryEdit';
import SearchScreen from './components/SearchScreen';

export type RootStackParamList = {
  Calendar: undefined;
  Edit: { entry?: DiaryEntry; date?: string };
  Search: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

interface NavigationProps {
  onInit: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onInit }) => {
  React.useEffect(() => {
    onInit();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Calendar"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Calendar"
          component={CalendarView}
          options={{ title: '日记日历' }}
        />
        <Stack.Screen
          name="Edit"
          component={DiaryEdit}
          options={({ route }) => ({
            title: route.params?.entry ? '编辑日记' : '新建日记',
          })}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: '搜索' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;