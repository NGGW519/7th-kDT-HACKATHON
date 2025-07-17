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
import MyPageScreen from './src/screens/MyPageScreen';
import ResidentScreen from './src/screens/ResidentScreen'; // ResidentScreen 임포트

const Tab = createBottomTabNavigator();
const BoardStack = createStackNavigator();
const HomeStack = createStackNavigator(); // Home 탭을 위한 스택 내비게이터 추가
const RootStack = createStackNavigator();

// Home 탭을 위한 스택 내비게이터
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={MainPage} options={{ headerShown: false }} />
      <HomeStack.Screen name="ResidentScreen" component={ResidentScreen} options={{ title: '지역 주민 페이지' }} />
      <HomeStack.Screen name="PostListScreen" component={PostListScreen} options={({ route }) => ({ title: route.params?.categoryName || '게시글 목록' })} />
    </HomeStack.Navigator>
  );
}

// Board 탭을 위한 스택 내비게이터
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

const MyPageScreenPlaceholder = () => (
  <View style={styles.center}>
    <Text>마이페이지</Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="홈">
      <Tab.Screen name="미션" component={MissionScreen} />
      <Tab.Screen name="게시판" component={BoardStackScreen} />
      <Tab.Screen name="홈" component={HomeStackScreen} />
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
        {/* ResidentScreen을 HomeStackScreen으로 이동했으므로 여기서 제거 */}
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