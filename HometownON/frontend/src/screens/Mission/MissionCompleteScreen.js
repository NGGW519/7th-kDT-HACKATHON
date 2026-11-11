import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const MissionCompleteScreen = ({ navigation, route }) => {
  const { type, timeElapsed } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>미션 완료!</Text>
      <Text style={styles.message}>성공적으로 미션을 완료하셨습니다.</Text>
      <Text style={styles.details}>미션 유형: {type}</Text>
      <Text style={styles.details}>소요 시간: {timeElapsed} 초</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ReturneeMain')}
      >
        <Text style={styles.buttonText}>메인 화면으로 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  message: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  details: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MissionCompleteScreen;
