import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// 실제 휴대폰에서 테스트할 때는 컴퓨터의 IP 주소를 사용하세요
// 예: 'http://192.168.1.100:8000/api' (ipconfig로 확인)
const API_BASE_URL = 'http://localhost:8000/api';

class LocationService {
  // 위치 권한 확인
  static async checkLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted;
      }
      return true; // iOS는 별도 처리
    } catch (err) {
      console.warn('위치 권한 확인 오류:', err);
      return false;
    }
  }

  // 위치 권한 요청
  static async requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        // 먼저 권한이 이미 있는지 확인
        const hasPermission = await this.checkLocationPermission();
        if (hasPermission) {
          return true;
        }

        // 권한 요청
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한 필요',
            message: '날씨 정보를 제공하기 위해 위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );

        console.log('위치 권한 요청 결과:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS는 별도 처리
    } catch (err) {
      console.warn('위치 권한 요청 오류:', err);
      return false;
    }
  }

  // 현재 위치 가져오기
  static getCurrentLocation() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('위치 가져오기 오류:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // 위치 권한 확인 및 위치 가져오기
  static async getLocationWithPermission() {
    try {
      console.log('위치 권한 요청 시작...');

      const hasPermission = await this.requestLocationPermission();
      console.log('위치 권한 결과:', hasPermission);

      if (!hasPermission) {
        console.log('위치 권한이 거부됨');
        Alert.alert(
          '위치 권한 필요',
          '날씨 정보를 제공하기 위해 위치 권한이 필요합니다. 설정 > 앱 > HometownON > 권한에서 위치 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동', onPress: () => {
                // 설정 앱으로 이동하는 로직 추가 가능
                console.log('설정으로 이동');
              }
            }
          ]
        );
        return null;
      }

      console.log('현재 위치 가져오기 시작...');
      const location = await this.getCurrentLocation();
      console.log('현재 위치:', location);

      // 에뮬레이터에서 미국 좌표가 나오면 한국 좌표로 대체
      // 경도가 음수(서경)이면 미국/유럽 지역이므로 한국 좌표로 대체
      if (location && location.longitude < 0) {
        console.log('⚠️ 에뮬레이터 기본 위치 감지 (서경), 함안군 좌표로 대체');
        console.log('기존 좌표:', location);
        const koreaLocation = {
          latitude: 35.2722,  // 함안군 위도
          longitude: 128.4061, // 함안군 경도
          accuracy: 100
        };
        console.log('대체 좌표:', koreaLocation);
        return koreaLocation;
      }

      return location;
    } catch (error) {
      console.error('위치 서비스 오류:', error);
      Alert.alert(
        '위치 오류',
        '현재 위치를 가져올 수 없습니다. GPS가 켜져 있는지 확인해주세요.',
        [{ text: '확인' }]
      );
      return null;
    }
  }

  // 테스트용 함수 - 권한 상태 확인
  static async debugPermissionStatus() {
    if (Platform.OS === 'android') {
      const fineLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const coarseLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );

      console.log('=== 위치 권한 상태 ===');
      console.log('FINE_LOCATION:', fineLocation);
      console.log('COARSE_LOCATION:', coarseLocation);
      console.log('==================');

      return { fineLocation, coarseLocation };
    }
    return null;
  }

  // ===== 탐색형 미션용 API 함수들 =====

  // 전체 위치 목록 조회
  static async getLocations(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        skip: params.skip || 0,
        limit: params.limit || 100,
        ...(params.categoryId && { category_id: params.categoryId }),
        ...(params.search && { search: params.search })
      });

      const response = await fetch(`${API_BASE_URL}/locations/?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get locations error:', error);
      throw error;
    }
  }

  // 근처 위치 검색 (탐색형 미션 핵심 기능)
  static async getNearbyLocations(latitude, longitude, radiusKm = 5.0, limit = 20) {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          radius_km: radiusKm,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get nearby locations error:', error);
      throw error;
    }
  }

  // 특정 위치 상세 정보 조회
  static async getLocationById(locationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/${locationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get location by ID error:', error);
      throw error;
    }
  }

  // 위치 카테고리 목록 조회
  static async getLocationCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/categories/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get location categories error:', error);
      throw error;
    }
  }

  // 탐색형 미션용 통합 함수 - 현재 위치 기반 근처 장소 가져오기
  static async getLocationsForExplorationMission(radiusKm = 5.0, limit = 20) {
    try {
      console.log('🎯 탐색형 미션용 위치 데이터 로딩 시작...');
      
      // 1. 현재 위치 획득
      const currentLocation = await this.getLocationWithPermission();
      if (!currentLocation) {
        throw new Error('현재 위치를 가져올 수 없습니다.');
      }

      console.log('📍 현재 위치:', currentLocation);
      
      // 2. 근처 위치들 검색
      const nearbyLocations = await this.getNearbyLocations(
        currentLocation.latitude,
        currentLocation.longitude,
        radiusKm,
        limit
      );

      console.log(`🏢 근처 위치 ${nearbyLocations.length}개 발견`);

      return {
        userLocation: currentLocation,
        nearbyLocations: nearbyLocations,
        totalCount: nearbyLocations.length
      };
    } catch (error) {
      console.error('Get locations for exploration mission error:', error);
      throw error;
    }
  }

  // 두 지점 간의 거리 계산 (Haversine 공식)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // 거리 (km)
  }

  static toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // 위치가 특정 반경 내에 있는지 확인 (미션 완료 체크용)
  static isWithinRadius(userLat, userLon, targetLat, targetLon, radiusMeters = 50) {
    const distance = this.calculateDistance(userLat, userLon, targetLat, targetLon);
    return distance * 1000 <= radiusMeters; // km를 m로 변환하여 비교
  }
}

export default LocationService;