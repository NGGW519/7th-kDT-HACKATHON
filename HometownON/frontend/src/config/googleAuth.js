import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { GOOGLE_CLIENT_ID_WEB, GOOGLE_CLIENT_ID_ANDROID, GOOGLE_CLIENT_ID_IOS } from '@env';

// Google OAuth Client IDs from environment variables
export const GOOGLE_CLIENT_IDS = {
  web: GOOGLE_CLIENT_ID_WEB,
  android: GOOGLE_CLIENT_ID_ANDROID,
  ios: GOOGLE_CLIENT_ID_IOS,
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

// Google OAuth 요청 생성
export const createGoogleAuthRequest = () => {
  const config = getGoogleAuthConfig();
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      ...config,
      responseType: 'id_token',
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  return { request, response, promptAsync };
};