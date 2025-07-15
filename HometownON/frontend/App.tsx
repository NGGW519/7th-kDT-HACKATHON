import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import MainPage from './src/screens/MainPage';
import TemporaryScreen from './src/screens/TemporaryScreen';

const Tab = createBottomTabNavigator();

// Placeholder components for other screens
const MissionScreen = () => (
  <View style={styles.center}>
    <Text>미션 페이지</Text>
  </View>
);
const BoardScreen = () => (
  <View style={styles.center}>
    <Text>게시판 페이지</Text>
  </View>
);
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
        <Tab.Screen name="게시판" component={BoardScreen} />
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
