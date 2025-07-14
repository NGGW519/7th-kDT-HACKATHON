// babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // 꼭 추가
  };
};

// 없으면 루트 디렉토리에 생성
// 생성하고 반드시 앱 재시작
// npx expo start --clear