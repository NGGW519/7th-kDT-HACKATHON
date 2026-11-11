module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          "module:react-native-dotenv",
          {
            "moduleName": "@env",
            // 모노레포 루트의 .env 를 읽는다 (서버 비밀키도 들어 있으므로 아래 allowlist 로 공개 변수만 허용)
            "path": "../../.env",
            "blocklist": null,
            "allowlist": ["API_URL", "GOOGLE_CLIENT_ID_WEB", "GOOGLE_CLIENT_ID_IOS", "GOOGLE_CLIENT_ID_ANDROID"],
            "safe": false,
            "allowUndefined": true,
          }
        ]
      ]
    };
  };
