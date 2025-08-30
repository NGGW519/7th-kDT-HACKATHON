import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const TestMap = () => {
  const testRegion = {
    latitude: 35.2722,   // �Ծȱ�
    longitude: 128.4061, // �Ծȱ�
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const handleMapReady = () => {
    console.log('? ���� �ε� �Ϸ�!');
    Alert.alert('����', '������ ���������� �ε�Ǿ����ϴ�!');
  };

  const handleMapError = (error) => {
    console.error('? ���� �ε� ����:', error);
    Alert.alert('����', `���� �ε� ����: ${error.message}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>?? ���� �׽�Ʈ</Text>
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
          title="�Ծȱ�"
          description="�׽�Ʈ ��Ŀ"
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