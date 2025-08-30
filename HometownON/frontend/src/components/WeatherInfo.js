import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import WeatherService from '../services/WeatherService';

const WeatherInfo = ({ weather, temperature, airQuality, isLoading }) => {
  const weatherIcon = WeatherService.getWeatherIcon(weather);
  const airQualityColor = WeatherService.getAirQualityColor(airQuality);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#FFF" />
        <Text style={styles.loadingText}>날씨 로딩중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.weatherContainer}>
        <Text style={styles.weatherIcon}>{weatherIcon}</Text>
        <Text style={styles.weatherText}>{weather}</Text>
        <Text style={styles.temperature}>{temperature}°C</Text>
      </View>
      <Text style={[styles.airQuality, { color: airQualityColor }]}>
        {airQuality}
      </Text>
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
  loadingText: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
  },
});

export default WeatherInfo;
