import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

import MainPage from './src/screens/MainPage';
import TemporaryScreen from './src/screens/TemporaryScreen';
import MissionScreen from './src/screens/MissionScreen';
import BoardScreen from './src/screens/BoardScreen';
import PostListScreen from './src/screens/PostListScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import PostWriteScreen from './src/screens/PostWriteScreen';
import SplashScreen from './src/screens/SplashScreen';

const Tab = createBottomTabNavigator();
const BoardStack = createStackNavigator();
const RootStack = createStackNavigator();

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

const MyPageScreen = () => (
  <View style={styles.center}>
    <Text>마이페이지</Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="미션" component={MissionScreen} />
      <Tab.Screen name="게시판" component={BoardStackScreen} />
      <Tab.Screen name="홈" component={MainPage} />
      <Tab.Screen name="임시" component={TemporaryScreen} />
      <Tab.Screen name="마이페이지" component={MyPageScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Splash">
        <RootStack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      </RootStack.Navigator>
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