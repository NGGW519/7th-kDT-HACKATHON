import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';

// Google OAuth Client IDs for different platforms
export const GOOGLE_CLIENT_IDS = {
  web: '862639857753-qits698ij6a301r8af5p6f1u9bloucic.apps.googleusercontent.com',
  android: '862639857753-hfhui2b0mkjsqjivvbub1m9euec6la5i.apps.googleusercontent.com', // Android 클라이언트 ID로 교체 필요
  ios: '862639857753-7g71imbcg3j27gu2modk8ldjnm0580bo.apps.googleusercontent.com', // iOS 클라이언트 ID로 교체 필요
};

// Platform-specific client ID
export const getGoogleClientId = () => {
  return Platform.select(GOOGLE_CLIENT_IDS);
};

// Google OAuth configuration
export const getGoogleAuthConfig = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'hometownon',
    useProxy: true, // Expo 프록시 사용
  });
  
  console.log('Redirect URI:', redirectUri); // 디버깅용
  
  return {
    clientId: getGoogleClientId(),
    scopes: ['openid', 'profile', 'email'],
    redirectUri: redirectUri,
  };
};
