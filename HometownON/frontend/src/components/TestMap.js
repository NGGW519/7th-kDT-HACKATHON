import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const TestMap = () => {
  const testRegion = {
    latitude: 35.2722,   // 함안군
    longitude: 128.4061, // 함안군
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const handleMapReady = () => {
    console.log('✅ 지도 로드 완료!');
    Alert.alert('성공', '지도가 정상적으로 로드되었습니다!');
  };

  const handleMapError = (error) => {
    console.error('❌ 지도 로드 실패:', error);
    Alert.alert('오류', `지도 로드 실패: ${error.message}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ 지도 테스트</Text>
      <MapView
        style={styles.map}
        initialRegion={testRegion}
        onMapReady={handleMapReady}
        onError={handleMapError}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={{
            latitude: 35.2722,
            longitude: 128.4061,
          }}
          title="함안군"
          description="테스트 마커"
          pinColor="red"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
  },
});

export default TestMap;