import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WeatherInfo = ({ weather, temperature, airQuality }) => {
  return (
    <View style={styles.container}>
      <View style={styles.weatherContainer}>
        <Text style={styles.weatherIcon}>☀️</Text>
        <Text style={styles.weatherText}>{weather}</Text>
        <Text style={styles.temperature}>{temperature}°C</Text>
      </View>
      <Text style={styles.airQuality}>{airQuality}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    marginLeft: 20,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  weatherIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  weatherText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginRight: 8,
  },
  temperature: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  airQuality: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
});

export default WeatherInfo;
