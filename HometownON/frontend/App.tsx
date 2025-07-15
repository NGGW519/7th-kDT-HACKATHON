import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // Import createStackNavigator
import { View, Text, StyleSheet } from 'react-native';

import MainPage from './src/screens/MainPage';
import TemporaryScreen from './src/screens/TemporaryScreen';
import MissionScreen from './src/screens/MissionScreen';
import BoardScreen from './src/screens/BoardScreen';
import PostListScreen from './src/screens/PostListScreen'; // Import PostListScreen
import PostDetailScreen from './src/screens/PostDetailScreen'; // Import PostDetailScreen
import PostWriteScreen from './src/screens/PostWriteScreen'; // Import PostWriteScreen

const Tab = createBottomTabNavigator();
const BoardStack = createStackNavigator(); // Create a stack navigator for Board

// Stack Navigator for Board related screens
function BoardStackScreen() {
  return (
    <BoardStack.Navigator>
      <BoardStack.Screen name="BoardMain" component={BoardScreen} options={{ headerShown: false }} />
      <BoardStack.Screen name="PostListScreen" component={PostListScreen} options={({ route }) => ({ title: route.params?.categoryName || '게시글 목록' })} />
      <BoardStack.Screen name="PostDetailScreen" component={PostDetailScreen} options={{ title: '게시글 상세' }} />
      <BoardStack.Screen name="PostWriteScreen" component={PostWriteScreen} options={{ title: '글 작성' }} />
    </BoardStack.Navigator>
  );
}

// Placeholder components for other screens
const MyPageScreen = () => (
  <View style={styles.center}>
    <Text>마이페이지</Text>
  </View>
);

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="미션" component={MissionScreen} />
        <Tab.Screen name="게시판" component={BoardStackScreen} />
        <Tab.Screen name="홈" component={MainPage} />
        <Tab.Screen name="임시" component={TemporaryScreen} />
        <Tab.Screen name="마이페이지" component={MyPageScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;