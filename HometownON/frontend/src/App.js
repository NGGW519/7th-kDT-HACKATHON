import React, { useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_CLIENT_ID_WEB, GOOGLE_CLIENT_ID_IOS } from '@env';
import 'react-native-gesture-handler';


const App = () => {
  useEffect(() => {
    // 환경변수 디버깅
    console.log('🔍 환경변수 확인:');
    console.log('GOOGLE_CLIENT_ID_WEB:', GOOGLE_CLIENT_ID_WEB);
    console.log('GOOGLE_CLIENT_ID_IOS:', GOOGLE_CLIENT_ID_IOS);
    
    // 환경변수가 undefined인지 확인
    if (!GOOGLE_CLIENT_ID_WEB || !GOOGLE_CLIENT_ID_IOS) {
      console.error('❌ 환경변수가 로드되지 않았습니다!');
      return;
    }
    
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID_WEB,
      iosClientId: GOOGLE_CLIENT_ID_IOS,
      scopes: ['email', 'profile'],
    });
  }, []);

  return <AppNavigator />;
};

export default App;
