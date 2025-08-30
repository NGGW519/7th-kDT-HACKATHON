const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://10.0.2.2:8000';

class WeatherService {
  // 현재 위치 기반 날씨 정보 가져오기
  static async getCurrentWeather(latitude, longitude) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather/current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        temperature: Math.round(data.temperature),
        weather: data.weather_condition,
        description: data.description,
        location: data.location,
        airQuality: data.air_quality || '보통',
      };
    } catch (error) {
      console.error('날씨 정보 가져오기 오류:', error);
      
      // 오류 시 기본값 반환
      return {
        temperature: 20,
        weather: '맑음',
        description: '날씨 정보를 가져올 수 없습니다',
        location: '현재 위치',
        airQuality: '보통',
      };
    }
  }

  // 날씨 아이콘 가져오기
  static getWeatherIcon(weather) {
    const iconMap = {
      '맑음': '☀️',
      '구름많음': '⛅',
      '흐림': '☁️',
      '비': '🌧️',
      '눈': '❄️',
      '소나기': '🌦️',
      '비/눈': '🌨️',
    };
    
    return iconMap[weather] || '☀️';
  }

  // 대기질 상태 색상
  static getAirQualityColor(airQuality) {
    const colorMap = {
      '좋음': '#4CAF50',
      '보통': '#FF9800',
      '나쁨': '#F44336',
      '매우나쁨': '#9C27B0',
    };
    
    return colorMap[airQuality] || '#FF9800';
  }
}

export default WeatherService;