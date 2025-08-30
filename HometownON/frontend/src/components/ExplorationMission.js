import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import LocationService from '../services/LocationService';

const ExplorationMission = ({ navigation, route }) => {
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyLocations, setNearbyLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapRegion, setMapRegion] = useState(null);
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
    const [missionData, setMissionData] = useState(null);

    useEffect(() => {
        loadExplorationData();
    }, []);

    const loadExplorationData = async () => {
        try {
            setLoading(true);
            console.log('🎯 탐색형 미션 데이터 로딩...');

            // route.params에서 미션 정보 확인
            const mission = route?.params?.mission;
            console.log('�  미션 정보:', mission);

            let targetLocation = null;
            let centerLocation = null;

            if (mission && mission.targetLocation) {
                // 특정 미션의 목표 위치가 있는 경우
                targetLocation = mission.targetLocation;
                centerLocation = targetLocation;
                console.log('🎯 목표 위치:', targetLocation);
            } else {
                // 일반적인 탐색형 미션 - 사용자 현재 위치 기반
                const currentLocation = await LocationService.getLocationWithPermission();
                if (!currentLocation) {
                    throw new Error('현재 위치를 가져올 수 없습니다.');
                }
                centerLocation = currentLocation;
                setUserLocation(currentLocation);
                console.log('📍 사용자 위치:', currentLocation);
            }

            // 중심 위치 기반으로 근처 장소 검색
            const nearbyData = await LocationService.getNearbyLocations(
                centerLocation.latitude,
                centerLocation.longitude,
                5.0, // 5km 반경
                20   // 최대 20개
            );

            console.log('🏢 근처 위치들:', nearbyData);
            setNearbyLocations(nearbyData);

            // 목표 위치가 있으면 목록에 추가 (중복 방지)
            if (targetLocation) {
                const targetLocationData = {
                    id: 'target',
                    name: mission.title || '목표 위치',
                    address: mission.address || '목표 주소',
                    coordinates: targetLocation,
                    isTarget: true
                };

                setNearbyLocations(prev => [targetLocationData, ...prev]);
                setSelectedLocation(targetLocationData);
            }

            // 지도 영역 설정
            const region = {
                latitude: centerLocation.latitude,
                longitude: centerLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            };
            console.log('🗺️ 지도 영역 설정:', region);
            setMapRegion(region);

            console.log(`✅ ${nearbyData.length}개 위치 로드 완료`);
        } catch (error) {
            console.error('❌ 탐색형 미션 데이터 로딩 실패:', error);

            // 실패 시 하드코딩된 함안 초등학교 위치 사용
            console.log('🏫 기본 위치로 함안 초등학교 설정');
            const defaultLocation = {
                latitude: 35.2722,   // 함안군 위도
                longitude: 128.4061, // 함안군 경도
            };

            const defaultMission = {
                id: 'default',
                name: '나의 모교 초등학교 방문하기',
                address: '경남 함안군 가야읍 함안대로 585-1',
                coordinates: defaultLocation,
                isTarget: true
            };

            setNearbyLocations([defaultMission]);
            setSelectedLocation(defaultMission);
            setMapRegion({
                latitude: defaultLocation.latitude,
                longitude: defaultLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);

        // 지도 모드에서는 해당 위치로 이동
        if (viewMode === 'map' && location.coordinates) {
            setMapRegion({
                latitude: location.coordinates.latitude,
                longitude: location.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }
    };

    const handleVisitLocation = async (location) => {
        try {
            // 현재 위치 다시 확인
            const currentLocation = await LocationService.getLocationWithPermission();
            if (!currentLocation) {
                Alert.alert('오류', '현재 위치를 확인할 수 없습니다.');
                return;
            }

            // 목표 위치와의 거리 확인 (50m 이내)
            const isNearby = LocationService.isWithinRadius(
                currentLocation.latitude,
                currentLocation.longitude,
                location.coordinates.latitude,
                location.coordinates.longitude,
                50 // 50미터
            );

            if (isNearby) {
                Alert.alert(
                    '🎉 미션 완료!',
                    `${location.name}에 도착했습니다! 미션을 완료하시겠습니까?`,
                    [
                        { text: '취소', style: 'cancel' },
                        {
                            text: '완료',
                            onPress: () => completeMission(location)
                        }
                    ]
                );
            } else {
                const distance = LocationService.calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    location.coordinates.latitude,
                    location.coordinates.longitude
                );

                Alert.alert(
                    '아직 도착하지 않았습니다',
                    `${location.name}까지 약 ${(distance * 1000).toFixed(0)}m 남았습니다. 더 가까이 가주세요.`,
                    [{ text: '확인' }]
                );
            }
        } catch (error) {
            console.error('위치 방문 확인 오류:', error);
            Alert.alert('오류', '위치 확인 중 오류가 발생했습니다.');
        }
    };

    const completeMission = (location) => {
        // 미션 완료 처리 로직
        console.log('미션 완료:', location.name);

        Alert.alert(
            '🎉 축하합니다!',
            `${location.name} 탐색 미션을 완료했습니다!`,
            [
                {
                    text: '확인',
                    onPress: () => navigation.goBack()
                }
            ]
        );
    };

    const renderLocationItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.locationItem,
                selectedLocation?.id === item.id && styles.selectedLocationItem
            ]}
            onPress={() => handleLocationSelect(item)}
        >
            <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{item.name}</Text>
                <Text style={styles.locationAddress}>{item.address}</Text>
                {item.coordinates && userLocation && (
                    <Text style={styles.locationDistance}>
                        거리: {(LocationService.calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            item.coordinates.latitude,
                            item.coordinates.longitude
                        ) * 1000).toFixed(0)}m
                    </Text>
                )}
            </View>
            <TouchableOpacity
                style={styles.visitButton}
                onPress={() => handleVisitLocation(item)}
            >
                <Text style={styles.visitButtonText}>방문하기</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>탐색 지역을 찾고 있습니다...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <Text style={styles.title}>🗺️ 탐색형 미션</Text>
                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
                        onPress={() => setViewMode('map')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>
                            지도
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
                        onPress={() => setViewMode('list')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>
                            목록
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 미션 정보 */}
            <View style={styles.missionInfo}>
                <Text style={styles.missionText}>
                    📍 주변 {nearbyLocations.length}개 장소를 탐색해보세요!
                </Text>
            </View>

            {/* 지도 또는 목록 뷰 */}
            {viewMode === 'map' ? (
                <View style={styles.mapContainer}>
                    <Text style={styles.debugText}>
                        지도 상태: {mapRegion ? '준비됨' : '로딩중'} | 위치: {nearbyLocations.length}개
                    </Text>

                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 35.2722,
                            longitude: 128.4061,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        onMapReady={() => {
                            console.log('✅ 지도 준비 완료!');
                        }}
                        onError={(error) => {
                            console.error('❌ 지도 오류:', error);
                            Alert.alert('지도 오류', `오류: ${error.message}`);
                        }}
                    >
                        {/* 사용자 위치 주변 반경 표시 */}
                        {userLocation && (
                            <Circle
                                center={{
                                    latitude: userLocation.latitude,
                                    longitude: userLocation.longitude,
                                }}
                                radius={5000} // 5km
                                strokeColor="rgba(0, 122, 255, 0.3)"
                                fillColor="rgba(0, 122, 255, 0.1)"
                            />
                        )}

                        {/* 기본 목표 마커 - 함안 초등학교 */}
                        <Marker
                            coordinate={{
                                latitude: 35.2722,
                                longitude: 128.4061,
                            }}
                            title="함안 초등학교"
                            description="경남 함안군 가야읍 함안대로 585-1"
                            pinColor="red"
                        />

                        {/* 데이터베이스에서 가져온 근처 위치들 */}
                        {nearbyLocations.map((location) => (
                            location.coordinates && (
                                <Marker
                                    key={location.id}
                                    coordinate={{
                                        latitude: location.coordinates.latitude,
                                        longitude: location.coordinates.longitude,
                                    }}
                                    title={location.name}
                                    description={location.address}
                                    onPress={() => handleLocationSelect(location)}
                                    pinColor={location.isTarget ? 'red' : 'blue'}
                                />
                            )
                        ))}
                    </MapView>
                </View>
            ) : (
                <FlatList
                    data={nearbyLocations}
                    renderItem={renderLocationItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.locationList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* 선택된 위치 정보 (지도 모드에서만) */}
            {viewMode === 'map' && selectedLocation && (
                <View style={styles.selectedLocationInfo}>
                    <Text style={styles.selectedLocationName}>{selectedLocation.name}</Text>
                    <Text style={styles.selectedLocationAddress}>{selectedLocation.address}</Text>
                    <TouchableOpacity
                        style={styles.visitSelectedButton}
                        onPress={() => handleVisitLocation(selectedLocation)}
                    >
                        <Text style={styles.visitSelectedButtonText}>이 장소 방문하기</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    activeToggle: {
        backgroundColor: '#007AFF',
    },
    toggleText: {
        fontSize: 14,
        color: '#666',
    },
    activeToggleText: {
        color: 'white',
        fontWeight: 'bold',
    },
    missionInfo: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    missionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    mapContainer: {
        flex: 1,
    },
    debugText: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    map: {
        flex: 1,
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    mapPlaceholderSubtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 5,
    },
    mapPlaceholderAddress: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    coordinatesContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    coordinatesText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    nearbyContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    nearbyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    nearbyItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    nearbyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    nearbyAddress: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    mapButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    mapButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationList: {
        flex: 1,
        padding: 16,
    },
    locationItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedLocationItem: {
        borderColor: '#007AFF',
        borderWidth: 2,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    locationAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    locationDistance: {
        fontSize: 12,
        color: '#007AFF',
    },
    visitButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        justifyContent: 'center',
    },
    visitButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    selectedLocationInfo: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    selectedLocationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    selectedLocationAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    visitSelectedButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    visitSelectedButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ExplorationMission;