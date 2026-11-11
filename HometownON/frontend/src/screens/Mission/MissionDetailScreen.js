import API_URL from '../../config/apiConfig';
import { authHeaders } from '../../services/apiClient';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MissionDetailScreen = ({ navigation, route }) => {
  const { type, cardId } = route.params; // Get cardId from params
  const [missionStarted, setMissionStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const confettiAnimation = useRef(new Animated.Value(0)).current;

  const [missionDetails, setMissionDetails] = useState(null); // State for fetched mission details
  const [locationDetails, setLocationDetails] = useState(null); // State for fetched location details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
  const fetchMissionDetails = async () => {
  try {
    const missionResponse = await fetch(`${API_URL}/api/missions/${cardId}`, { headers: await authHeaders() });
    if (!missionResponse.ok) {
      throw new Error(`HTTP error! status: ${missionResponse.status}`);
    }
    const missionData = await missionResponse.json();
    setMissionDetails(missionData);

    // Extract location name from mission title
    // Assuming mission title is like "장소이름,- 미션 설명"
    const titleParts = missionData.title.split(', ');
    const locationName = titleParts.length > 1 ? titleParts[0] : null;

    if (locationName) {
      try {
        const locationResponse = await fetch(
          `${API_URL}/api/locations/by_name/${encodeURIComponent(locationName.trim())}`
        );
        if (!locationResponse.ok) {
          throw new Error(`HTTP error! status: ${locationResponse.status}`);
        }
        const locationData = await locationResponse.json();
        // Parse POINT(lon lat) from geom
        const geomMatch = locationData.geom.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (geomMatch) {
          const longitude = parseFloat(geomMatch[1]);
          const latitude = parseFloat(geomMatch[2]);
          setLocationDetails({
            ...locationData,
            coordinates: { latitude, longitude }
          });
        } else {
          // console.warn("Could not parse geom:", locationData.geom); // Removed log
        }
      } catch (e) {
        // console.error("Failed to fetch location details:", e); // Removed log
        // Don't set error for main mission if location fails, just log
      }
    } else {
      // console.warn("No location name extracted from mission title."); // Removed log
    }
  } catch (e) {
    setError(e);
    // console.error("Failed to fetch mission details:", e); // Removed log
  } finally {
    setLoading(false);
  }
};

    fetchMissionDetails();

    let interval;
    if (missionStarted && timeElapsed < 60) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [missionStarted, timeElapsed, cardId]);

  // md 파일에서 추가된 부분
  const getMissionIcon = (missionType) => {
    switch (missionType) {
      case 'exploration': return '🎲';
      case 'bonding': return '🤝';
      case 'career': return '💼';
      default: return '🎯'; // Default icon
    }
  };

  const handleStartMission = () => {
    setMissionStarted(true);
  };

  const handleCompleteMission = async () => {
    try {
      const response = await fetch(`${API_URL}/api/missions/${cardId}`, {
        method: 'PATCH',
        headers: await authHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) {
        // 서버에 저장되지 않았으므로 완료 처리로 넘어가지 않는다.
        if (response.status === 401) {
          Alert.alert('알림', '로그인이 필요합니다.');
        } else {
          Alert.alert('알림', '완료 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }
        return;
      }

      // 서버 저장에 성공한 경우에만 화면을 완료 상태로 바꾼다.
      setMissionDetails(prevDetails => ({
        ...prevDetails,
        status: 'completed', // Assuming 'status' field exists in missionDetails
      }));

      setShowCompletionModal(true);
      Animated.timing(confettiAnimation, {
        toValue: 1,
        duration: 1000, // Animation duration
        useNativeDriver: true,
      }).start(() => {
        // After animation, navigate and hide modal
        setTimeout(() => {
          setShowCompletionModal(false);
          navigation.navigate('MissionComplete', { type, timeElapsed });
        }, 500); // Short delay before navigating
      });
    } catch (error) {
      console.error("Failed to update mission status (API call error):", error);
      Alert.alert('알림', '완료 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setShowCompletionModal(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // md 파일의 new_string 반영
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {type === 'exploration' ? '탐색형' : type === 'bonding' ? '유대형' : '커리어형'} 미션
          </Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && <Text style={styles.loadingText}>미션 상세 로딩 중...</Text>}
        {error && <Text style={styles.errorText}>미션 상세 로드 실패: {error.message}</Text>}
        {!loading && !error && !missionDetails && (
          <Text style={styles.noMissionDetailsText}>미션 상세 정보를 찾을 수 없습니다.</Text>
        )}
        {!loading && !error && missionDetails && (
          /* Mission Card */
          <View style={styles.missionCard}>
            {/* Mission Header */}
            <View style={styles.missionHeader}>
              <Text style={styles.missionIcon}>{getMissionIcon(missionDetails.mission_type)}</Text>
              <Text style={styles.missionTitle}>{missionDetails.title}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>난이도: {missionDetails.difficulty}</Text>
              </View>
            </View>

            {/* Map */}
            {locationDetails && locationDetails.coordinates ? (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: locationDetails.coordinates.longitude,
                    longitude: locationDetails.coordinates.latitude,
                    latitudeDelta: 0.01, // Increased delta
                    longitudeDelta: 0.01, // Increased delta
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                  onMapReady={() => {
                    console.log('✅ 미션 상세 지도 로드 완료!');
                    console.log('📍 MapView initialRegion Lat:', locationDetails.coordinates.longitude, 'Lng:', locationDetails.coordinates.latitude);
                  }}
                  onError={(error) => {
                    console.error('❌ 미션 상세 지도 오류:', error);
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: locationDetails.coordinates.longitude,
                      longitude: locationDetails.coordinates.latitude,
                    }}
                    title={locationDetails.name}
                    description={locationDetails.address}
                    pinColor="red"
                  />
                </MapView>
              </View>
            ) : (
              <View style={styles.mapContainer}>
                <Text style={styles.loadingText}>지도 로딩 중...</Text>
              </View>
            )}

            {/* Address */}
            {locationDetails && (
              <View style={styles.addressContainer}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.address}>{locationDetails.address}</Text>
              </View>
            )}

            {/* Timer */}
            {missionStarted && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>경과 시간: {formatTime(timeElapsed)}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.startButton, missionStarted && styles.disabledButton]}
                onPress={handleStartMission}
                disabled={missionStarted}
              >
                <Text style={styles.startButtonText}>
                  {missionStarted ? '미션 진행 중...' : '미션 시작'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[ 
                  styles.completeButton,
                  !missionStarted && styles.disabledButton
                ]}
                onPress={handleCompleteMission}
                disabled={!missionStarted}
              >
                <Text style={styles.completeButtonText}>미션 완료</Text>
              </TouchableOpacity>
            </View>

            {/* Instruction */}
            <Text style={styles.instruction}>{missionDetails.description}</Text>

            {/* Mission Guide Button */}
            <TouchableOpacity style={styles.guideButton}>
              <Text style={styles.guideIcon}>{getMissionIcon(missionDetails.mission_type)}</Text>
              <Text style={styles.guideText}>미션 수행 방법 안내</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    <Modal
        animationType="fade"
        transparent={true}
        visible={showCompletionModal}
        onRequestClose={() => {
          setShowCompletionModal(!showCompletionModal);
        }}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.confetti,
              {
                opacity: confettiAnimation,
                transform: [
                  {
                    scale: confettiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.5],
                    }),
                  },
                  {
                    translateY: confettiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -150],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.confettiText}>🎉</Text>
          </Animated.View>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>미션을 완료하셨습니다!</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6956E5',
  },
  headerSafeArea: {
    backgroundColor: '#6956E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#6956E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#F8F9FA',
  },
  missionCard: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6956E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  missionHeader: {
    backgroundColor: '#6956E5',
    padding: 20,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  missionIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  levelBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6956E5',
  },

  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  map: {
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  address: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  timerContainer: {
    backgroundColor: '#FF9800',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF8F00',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timerText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: '#FF9800',
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F57C00',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completeButton: {
    backgroundColor: '#FF9800',
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F57C00',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    borderColor: '#999',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 20,
    lineHeight: 16,
  },
  guideButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#F57C00',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  guideIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  guideText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confetti: {
    position: 'absolute',
    top: '40%',
    left: '45%',
  },
  confettiText: {
    fontSize: 50,
  },
});

export default MissionDetailScreen;
