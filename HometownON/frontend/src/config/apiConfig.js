import { Platform } from 'react-native';
import { API_URL as ENV_API_URL } from '@env';

// API 서버의 기본 URL.
// 루트 .env 의 API_URL 을 쓰고, 없으면 에뮬레이터 기본값을 쓴다.
//  - 실제 기기: 서버 컴퓨터의 내부 IP (예: http://192.168.0.42:8000) 또는 ngrok/배포 주소를 .env 의 API_URL 에 적는다.
//  - Android 에뮬레이터: http://10.0.2.2:8000 / iOS 시뮬레이터: http://localhost:8000
const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const API_URL = ENV_API_URL || DEFAULT_API_URL;

export const API_BASE = `${API_URL}/api`;

export default API_URL;
