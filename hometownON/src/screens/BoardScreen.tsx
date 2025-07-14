import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BoardSelectionScreen from './BoardSelectionScreen';
import FreeBoardScreen from './FreeBoardScreen';
import RequestBoardScreen from './RequestBoardScreen';

const Stack = createStackNavigator();

const BoardScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BoardSelection" component={BoardSelectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FreeBoard" component={FreeBoardScreen} options={{ title: '자유 게시판' }} />
      <Stack.Screen name="RequestBoard" component={RequestBoardScreen} options={{ title: '의뢰 게시판' }} />
    </Stack.Navigator>
  );
};

export default BoardScreen;