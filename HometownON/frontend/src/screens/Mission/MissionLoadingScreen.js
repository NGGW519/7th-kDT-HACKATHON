import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const MissionLoadingScreen = ({ navigation, route }) => {
  const [loadingText, setLoadingText] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const loadingSteps = [
    '미션 데이터 로딩 중...',
    '지역 정보 확인 중...',
    '오늘의 미션 준비 중...',
    '미션 카드 생성 중...',
    '시스템 활성화 중...',
    '준비 완료!',
  ];

  useEffect(() => {
    // 초기 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 로딩 단계별 텍스트 변경
    const textInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < loadingSteps.length - 1) {
          setLoadingText(loadingSteps[prev]);
          return prev + 1;
        } else {
          setLoadingText(loadingSteps[loadingSteps.length - 1]);
          clearInterval(textInterval);
          return prev;
        }
      });
    }, 800);

    // 진행률 애니메이션
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 5000, // 5초
      useNativeDriver: false,
    }).start();

    // 진행률 퍼센트 업데이트
    const progressInterval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev < 100) {
          return prev + 1;
        }
        clearInterval(progressInterval);
        return 100;
      });
    }, 50); // 50ms마다 1%씩 증가

    // 5초 후 미션 리스트 화면으로 이동
    const timer = setTimeout(() => {
      navigation.replace('MissionList');
    }, 5000);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* 배경 그라데이션 효과 */}
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
      </View>

      {/* 메인 콘텐츠 */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* 로고 */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/splash_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>고향으로 ON</Text>
          <Text style={styles.logoSubtext}>지역 미션 시작!</Text>
        </View>

        {/* 로딩 텍스트 */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{loadingText}</Text>
          <View style={styles.dotsContainer}>
            <Text style={styles.dot}>●</Text>
            <Text style={styles.dot}>●</Text>
            <Text style={styles.dot}>●</Text>
          </View>
        </View>

        {/* 진행률 바 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {progressPercent}%
          </Text>
        </View>

        {/* 팁 */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>💡 팁</Text>
          <Text style={styles.tipText}>
            미션을 완료하면 배지를 얻을 수 있어요!
          </Text>
        </View>
      </Animated.View>

      {/* 하단 디코레이션 */}
      <View style={styles.bottomDecoration}>
        <Text style={styles.decorationText}>⚡ 미션 준비 완료 ⚡</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2d2d2d',
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(105, 86, 229, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6956E5',
    letterSpacing: 2,
    marginBottom: 5,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 1,
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    fontSize: 20,
    color: '#6956E5',
    marginHorizontal: 5,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6956E5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 40,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6956E5',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  decorationText: {
    fontSize: 12,
    color: '#6956E5',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});

export default MissionLoadingScreen;
