import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FreeBoardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>자유 게시판</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
