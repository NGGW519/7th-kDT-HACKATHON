import React from 'react';
import { Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ReturneeSignUpScreen from '../screens/ReturneeSignUpScreen';
import ResidentSignUpScreen from '../screens/ResidentSignUpScreen';
import MentorSignUpScreen from '../screens/MentorSignUpScreen';
import ReturneeMainScreen from '../screens/ReturneeMainScreen';
import ResidentMainScreen from '../screens/ResidentMainScreen';
import MentorMainScreen from '../screens/MentorMainScreen';
import MissionListScreen from '../screens/MissionListScreen';
import MissionDetailScreen from '../screens/MissionDetailScreen';
import MissionCardGameScreen from '../screens/MissionCardGameScreen';
import MissionLoadingScreen from '../screens/MissionLoadingScreen';
import MissionDashboardScreen from '../screens/MissionDashboardScreen';
import MyPageScreen from '../screens/MyPageScreen';
import ResidentMyPageScreen from '../screens/ResidentMyPageScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import AchievementScreen from '../screens/AchievementScreen';
import GoalSettingScreen from '../screens/GoalSettingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import BoardScreen from '../screens/BoardScreen';
import BoardDetailScreen from '../screens/BoardDetailScreen';
import BoardWriteScreen from '../screens/BoardWriteScreen';
import RequestBoardScreen from '../screens/RequestBoardScreen';
import MentorBoardScreen from '../screens/MentorBoardScreen';
import FreeBoardScreen from '../screens/FreeBoardScreen';
import MessengerScreen from '../screens/MessengerScreen';
import MentorDetailScreen from '../screens/MentorDetailScreen';
import FreeBoardWriteScreen from '../screens/FreeBoardWriteScreen';
import MentorSeekingWriteScreen from '../screens/MentorSeekingWriteScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ExplorationMission from '../components/ExplorationMission';
import TestMap from '../components/TestMap';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 귀향자 탭 네비게이터
const ReturneeTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ReturneeMain"
        component={ReturneeMainScreen}
        options={{
          tabBarLabel: '메인',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/home.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MissionStatus"
        component={MissionListScreen}
        options={{
          tabBarLabel: '미션현황',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/mission.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />


      <Tab.Screen
        name="Board"
        component={BoardScreen}
        options={{
          tabBarLabel: '게시판',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/board.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarLabel: '챗봇',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/chatbot-1.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이페이지',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/settings.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};



// 지역주민 탭 네비게이터
const ResidentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#9C27B0',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ResidentMain"
        component={ResidentMainScreen}
        options={{
          tabBarLabel: '메인',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/home.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="RequestStatus"
        component={ResidentMainScreen} // 임시로 같은 화면 사용
        options={{
          tabBarLabel: '의뢰 현황',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/mission.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="RequestBoard"
        component={ResidentMainScreen} // 임시로 같은 화면 사용
        options={{
          tabBarLabel: '의뢰자 게시판',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/board.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Messenger"
        component={ResidentMainScreen} // 임시로 같은 화면 사용
        options={{
          tabBarLabel: '메신저',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/chatbot-1.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={ResidentMyPageScreen}
        options={{
          tabBarLabel: '마이페이지',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/settings.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 멘토 탭 네비게이터
const MentorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="MentorMain"
        component={MentorMainScreen}
        options={{
          tabBarLabel: '메인',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/home.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="EducationStatus"
        component={MentorMainScreen} // 임시로 같은 화면 사용
        options={{
          tabBarLabel: '교육 현황',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/mission.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MentorBoard"
        component={MentorMainScreen} // 임시로 같은 화면 사용
        options={{
          tabBarLabel: '멘토 게시판',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/board.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Messenger"
        component={MentorMainScreen} // 임시로 같은 화면 사용
        options={{
          tabBarLabel: '메신저',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/chatbot-1.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MentorMainScreen} // 임시로 같은 화면 사용
        options={{
          tabBarLabel: '마이페이지',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/settings.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ReturneeSignUp" component={ReturneeSignUpScreen} />
        <Stack.Screen name="ResidentSignUp" component={ResidentSignUpScreen} />
        <Stack.Screen name="MentorSignUp" component={MentorSignUpScreen} />
        
        {/* Main App Screens */}
        <Stack.Screen name="ReturneeMain" component={ReturneeTabNavigator} />
        <Stack.Screen name="ResidentMain" component={ResidentTabNavigator} />
        <Stack.Screen name="MentorMain" component={MentorTabNavigator} />
        
        {/* Mission Screens */}
        <Stack.Screen name="MissionLoading" component={MissionLoadingScreen} />
        <Stack.Screen name="MissionList" component={MissionListScreen} />
        <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
        <Stack.Screen name="MissionCardGame" component={MissionCardGameScreen} />
        <Stack.Screen name="MissionDashboard" component={MissionDashboardScreen} />
        
        {/* MyPage Screens */}
        <Stack.Screen name="ResidentMyPage" component={ResidentMyPageScreen} />
        
        {/* Additional Screens */}
        <Stack.Screen 
          name="Chatbot" 
          component={ChatbotScreen}
        />
        <Stack.Screen 
          name="Achievement" 
          component={AchievementScreen}
        />
        <Stack.Screen 
          name="GoalSetting" 
          component={GoalSettingScreen}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
        />
        <Stack.Screen 
          name="Help" 
          component={HelpScreen}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen}
        />
                <Stack.Screen
          name="PrivacySettings"
          component={PrivacySettingsScreen}
        />
        <Stack.Screen
          name="Board"
          component={BoardScreen}
        />
        <Stack.Screen
          name="BoardDetail"
          component={BoardDetailScreen}
        />
        <Stack.Screen
          name="BoardWrite"
          component={BoardWriteScreen}
        />
        <Stack.Screen
          name="RequestBoard"
          component={RequestBoardScreen}
        />
        <Stack.Screen
          name="MentorBoard"
          component={MentorBoardScreen}
        />
        <Stack.Screen
          name="FreeBoard"
          component={FreeBoardScreen}
        />
        <Stack.Screen
          name="Messenger"
          component={MessengerScreen}
        />
        <Stack.Screen
          name="MentorDetail"
          component={MentorDetailScreen}
        />
        <Stack.Screen
          name="FreeBoardWrite"
          component={FreeBoardWriteScreen}
        />
        <Stack.Screen
          name="MentorSeekingWrite"
          component={MentorSeekingWriteScreen}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
        />
        <Stack.Screen
          name="EducationMentor"
          component={ReturneeMainScreen} // 임시로 같은 화면 사용
        />
        <Stack.Screen
          name="ExplorationMission"
          component={ExplorationMission}
          options={{
            headerShown: true,
            title: '탐색형 미션',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="TestMap"
          component={TestMap}
          options={{
            headerShown: true,
            title: '지도 테스트',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
