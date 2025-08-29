
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Splash: undefined;
  MainScreen: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

/**
 * @function checkUserStatus
 * @description 사용자 로그인 상태를 확인하고 초기 데이터를 로딩하는 비동기 함수.
 * 실제 앱에서는 사용자 인증 토큰 확인, 초기 데이터 페치 등을 수행합니다.
 * 현재는 1.5초 지연을 시뮬레이션합니다.
 * @returns {Promise<void>}
 */
const checkUserStatus = (): Promise<void> => {
  return new Promise(resolve => {
    // 1.5초 동안 무언가 작업이 일어나는 것을 시뮬레이션합니다.
    setTimeout(() => {
      resolve();
    }, 1500);
  });
};

/**
 * @function SplashScreen
 * @description 앱 시작 시 보여지는 스플래시 화면 컴포넌트.
 * 앱의 초기 로딩 및 사용자 상태 확인을 담당합니다.
 * @param {SplashScreenProps} props - 컴포넌트 props.
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const prepare = async () => {
      // 비동기 작업을 기다립니다.
      await checkUserStatus();
      
      // 작업이 완료되면 메인 화면으로 이동합니다.
      navigation.replace('MainTabs', { screen: '홈', params: { screen: 'HomeMain' } });
    };

    prepare();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/splash_logo.png')}
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>앱을 준비 중입니다...</Text>
    </View>
  );
};

import { styles } from './SplashScreen.styles';

export default SplashScreen;
