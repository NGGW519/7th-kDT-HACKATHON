```markdown
# MissionDetailScreen.js 변경 사항

`C:\ho\HometownON\frontend\src\screens\MissionDetailScreen.js` 파일에 적용할 변경 사항입니다.
정확한 적용을 위해 `old_string`과 `new_string`을 제공합니다.

---

## 1. 메인 JSX 콘텐츠 교체

이 변경은 화면의 주요 렌더링 부분을 백엔드에서 가져온 `missionDetails` 데이터를 사용하도록 업데이트하고, 로딩 및 오류 상태를 처리합니다.

**`old_string` (현재 파일의 JSX `return` 문 전체):**

```javascript
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
```

**`new_string` (교체할 새로운 JSX `return` 문 전체):**

```javascript
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
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 35.2722, // Placeholder coordinates for now, as backend doesn't provide them directly
                  longitude: 128.4061, // Placeholder coordinates
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
                    latitude: 35.2722, // Placeholder coordinates
                    longitude: 128.4061, // Placeholder coordinates
                  }}
                  title={missionDetails.title}
                  description={missionDetails.description} // Using description as address for now
                  pinColor="red"
                />
              </MapView>
            </View>

            {/* Address */}
            <View style={styles.addressContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.address}>{missionDetails.description}</Text> {/* Using description as address for now */}
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
            <Text style={styles.instruction}>{missionDetails.description}</Text> {/* Using description as instruction for now */}

            {/* Mission Guide Button */}
            <TouchableOpacity style={styles.guideButton}>
              <Text style={styles.guideIcon}>{getMissionIcon(missionDetails.mission_type)}</Text>
              <Text style={styles.guideText}>미션 수행 방법 안내</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
```

---

## 2. `getMissionIcon` 함수 추가

이 함수는 `MissionDetailScreen` 컴포넌트 내에서 `handleStartMission` 함수 위에 추가되어야 합니다.

**`new_string` (추가할 `getMissionIcon` 함수):**

```javascript
  const getMissionIcon = (missionType) => {
    switch (missionType) {
      case 'exploration': return '🎲';
      case 'bonding': return '🤝';
      case 'career': return '💼';
      default: return '🎯'; // Default icon
    }
  };
```

**`old_string` (함수를 추가할 위치의 바로 다음 코드):**

```javascript
  const handleStartMission = () => {
    setMissionStarted(true);
  };
```
```