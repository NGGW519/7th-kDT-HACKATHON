
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

// 실제 앱에서는 이 함수에서 사용자 로그인 상태 확인, 초기 데이터 로딩 등을 수행합니다.
const checkUserStatus = (): Promise<void> => {
  return new Promise(resolve => {
    // 1.5초 동안 무언가 작업이 일어나는 것을 시뮬레이션합니다.
    setTimeout(() => {
      resolve();
    }, 1500);
  });
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const prepare = async () => {
      // 비동기 작업을 기다립니다.
      await checkUserStatus();
      
      // 작업이 완료되면 메인 화면으로 이동합니다.
      navigation.replace('Main');
    };

    prepare();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/splash_logo.png')}
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>앱을 준비 중입니다...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  }
});

export default SplashScreen;
