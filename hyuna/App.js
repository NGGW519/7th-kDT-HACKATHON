// App.js 또는 App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MainPage from './pages/MainPage';
// import OtherPage from './src/pages/OtherPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={MainPage} />
        {/* <Stack.Screen name="Other" component={OtherPage} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
