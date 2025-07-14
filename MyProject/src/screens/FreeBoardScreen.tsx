
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FreeBoardScreen = () => {
  return (
    <View style={styles.container}>
      <Text>자유 게시판</Text>
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

export default FreeBoardScreen;
