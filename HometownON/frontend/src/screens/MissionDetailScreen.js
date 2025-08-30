import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MissionDetailScreen = ({ navigation, route }) => {
  const { type } = route.params;
  const [missionStarted, setMissionStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);


  useEffect(() => {
    let interval;
    if (missionStarted && timeElapsed < 60) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [missionStarted, timeElapsed]);

  const getMissionData = () => {
    switch (type) {
      case 'exploration':
        return {
          title: '나의 모교 초등학교 방문하기',
          address: '경남 함안군 가야읍 함안대로 585-1 585-2',
          instruction: '탐색형 미션은 1분 동안 머무르면 미션 완료 버튼이 활성화됩니다',
          icon: '🎲',
          coordinates: {
            latitude: 35.2722,   // 함안 초등학교 위도
            longitude: 128.4061, // 함안 초등학교 경도
          },
        };
      case 'bonding':
        return {
          title: '지역 주민과의 만남',
          address: '경남 함안군 가야읍 시장로 123',
          instruction: '유대형 미션은 지역 주민과 대화를 나누면 미션 완료 버튼이 활성화됩니다',
          icon: '🤝',
          coordinates: {
            latitude: 35.2700,   // 함안 시장 위도
            longitude: 128.4050, // 함안 시장 경도
          },
        };
      case 'career':
        return {
          title: '새로운 기술 배우기',
          address: '경남 함안군 가야읍 교육로 456',
          instruction: '커리어형 미션은 새로운 기술을 배우면 미션 완료 버튼이 활성화됩니다',
          icon: '💼',
          coordinates: {
            latitude: 35.2750,   // 함안 교육센터 위도
            longitude: 128.4080, // 함안 교육센터 경도
          },
        };
      default:
        return {
          title: '미션 | LV.1',
          address: '경남 함안군 가야읍',
          instruction: '미션을 수행하면 완료 버튼이 활성화됩니다',
          icon: '🎯',
          coordinates: {
            latitude: 35.2722,   // 기본 함안군 위도
            longitude: 128.4061, // 기본 함안군 경도
          },
        };
    }
  };

  const missionData = getMissionData();

  const handleStartMission = () => {
    setMissionStarted(true);
  };

  const handleCompleteMission = () => {
    // 미션 완료 로직
    navigation.navigate('MissionComplete', { type, timeElapsed });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };







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
        {/* Mission Card */}
        <View style={styles.missionCard}>
          {/* Mission Header */}
          <View style={styles.missionHeader}>
            <Text style={styles.missionIcon}>{missionData.icon}</Text>
            <Text style={styles.missionTitle}>{missionData.title}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LV.1</Text>
            </View>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: missionData.coordinates.latitude,
                longitude: missionData.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
              onMapReady={() => {
                console.log('✅ 미션 상세 지도 로드 완료!');
              }}
              onError={(error) => {
                console.error('❌ 미션 상세 지도 오류:', error);
              }}
            >
              <Marker
                coordinate={{
                  latitude: missionData.coordinates.latitude,
                  longitude: missionData.coordinates.longitude,
                }}
                title={missionData.title}
                description={missionData.address}
                pinColor="red"
              />
            </MapView>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.address}>{missionData.address}</Text>
          </View>

          {/* Timer (if mission started) */}
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
                (!missionStarted || timeElapsed < 60) && styles.disabledButton
              ]}
              onPress={handleCompleteMission}
              disabled={!missionStarted || timeElapsed < 60}
            >
              <Text style={styles.completeButtonText}>미션 완료</Text>
            </TouchableOpacity>
          </View>

          {/* Instruction */}
          <Text style={styles.instruction}>{missionData.instruction}</Text>

          {/* Mission Guide Button */}
          <TouchableOpacity style={styles.guideButton}>
            <Text style={styles.guideIcon}>{missionData.icon}</Text>
            <Text style={styles.guideText}>미션 수행 방법 안내</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: 'linear-gradient(135deg, #FFD700, #FFA000)',
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
});

export default MissionDetailScreen;

