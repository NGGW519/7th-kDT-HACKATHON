import React, { useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_CLIENT_ID_WEB, GOOGLE_CLIENT_ID_IOS } from '@env';

import 'react-native-gesture-handler';

const App = () => {
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID_WEB || !GOOGLE_CLIENT_ID_IOS) {
      console.error('❌ Google Client ID가 .env 파일에서 로드되지 않았습니다!');
      return;
    }

    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID_WEB,
      iosClientId: GOOGLE_CLIENT_ID_IOS,
      scopes: ['email', 'profile'],
      offlineAccess: true,
    });
  }, []);

  return <AppNavigator />;
};

export default App;
