import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';

// Google OAuth Client IDs from environment variables
export const GOOGLE_CLIENT_IDS = {
  web: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
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