import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';

import MainScreen from './src/core/screens/MainScreen';
import TemporaryScreen from './src/core/screens/TemporaryScreen';
import MissionScreen from './src/features/mission/screens/MissionScreen';
import BoardScreen from './src/features/board/screens/BoardScreen';
import PostListScreen from './src/features/board/screens/PostListScreen';
import PostDetailScreen from './src/features/board/screens/PostDetailScreen';
import PostWriteScreen from './src/features/board/screens/PostWriteScreen';
import SplashScreen from './src/core/screens/SplashScreen';
import MyPageScreen from './src/features/mypage/screens/MyPageScreen';
import ResidentScreen from './src/features/resident/screens/ResidentScreen';

const Tab = createBottomTabNavigator();
const BoardStack = createStackNavigator();
const HomeStack = createStackNavigator(); // Home 탭을 위한 스택 내비게이터 추가
const RootStack = createStackNavigator();

// Home 탭을 위한 스택 내비게이터
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={MainScreen} options={{ headerShown: false }} />
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



function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="홈">
      <Tab.Screen name="미션" component={MissionScreen} />
      <Tab.Screen name="게시판" component={BoardStackScreen} />
      <Tab.Screen name="홈" component={HomeStackScreen} />
      <Tab.Screen name="AI챗봇" component={ChatScreen} />
      <Tab.Screen name="마이페이지" component={MyPageScreen} />
    </Tab.Navigator>
  );
}

/**
 * @function App
 * @description 애플리케이션의 최상위 컴포넌트.
 * 스플래시 화면과 메인 탭 내비게이터를 관리하는 루트 스택 내비게이터를 설정합니다.
 */
function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Splash">
        <RootStack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        {/* ResidentScreen을 HomeStackScreen으로 이동했으므로 여기서 제거 */}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}



export default App;