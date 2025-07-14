
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from '../screens/MainPage';
import MissionScreen from '../screens/MissionScreen';
import BoardScreen from '../screens/BoardScreen';
import MyPageScreen from '../screens/MyPageScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="홈" component={MainPage} />
      <Tab.Screen name="미션" component={MissionScreen} />
      <Tab.Screen name="게시판" component={BoardScreen} />
      <Tab.Screen name="마이페이지" component={MyPageScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
