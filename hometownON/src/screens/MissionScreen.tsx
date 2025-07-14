
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MissionScreen = () => {
  return (
    <View style={styles.container}>
      <Text>미션 화면</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MissionScreen;
