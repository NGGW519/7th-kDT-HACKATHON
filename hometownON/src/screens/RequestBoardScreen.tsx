
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RequestBoardScreen = () => {
  return (
    <View style={styles.container}>
      <Text>의뢰 게시판</Text>
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

export default RequestBoardScreen;
