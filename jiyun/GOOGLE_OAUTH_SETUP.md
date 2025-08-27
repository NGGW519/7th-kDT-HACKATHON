# Google OAuth 설정 가이드

이 앱에서 Google 소셜 로그인을 사용하기 위해서는 Google Cloud Console에서 OAuth 2.0 클라이언트를 설정해야 합니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 1.2 OAuth 동의 화면 설정
1. "API 및 서비스" > "OAuth 동의 화면" 메뉴로 이동
2. 사용자 유형 선택 (외부 또는 내부)
3. 앱 정보 입력:
   - 앱 이름: "고향으로 ON"
   - 사용자 지원 이메일
   - 개발자 연락처 정보

### 1.3 OAuth 2.0 클라이언트 ID 생성
1. "API 및 서비스" > "사용자 인증 정보" 메뉴로 이동
2. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택
3. 애플리케이션 유형 선택:
   - **Android**: Android 앱용
   - **iOS**: iOS 앱용
   - **웹**: 웹 애플리케이션용 (개발 중 테스트용)

### 1.4 Android 설정
```
패키지 이름: com.yourcompany.hometownon
SHA-1 인증서 지문: (개발자 키스토어의 SHA-1)
```

### 1.5 iOS 설정
```
번들 ID: com.yourcompany.hometownon
```

### 1.6 웹 설정 (개발용)
```
승인된 JavaScript 원본: http://localhost:19006
승인된 리디렉션 URI: http://localhost:19006
```

## 2. 앱 설정

### 2.1 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2.2 코드에서 클라이언트 ID 교체
다음 파일들에서 `YOUR_GOOGLE_CLIENT_ID`를 실제 클라이언트 ID로 교체:

- `src/screens/SignInScreen.js`
- `src/screens/ReturneeSignUpScreen.js`
- `src/screens/ResidentSignUpScreen.js`
- `src/screens/MentorSignUpScreen.js`

```javascript
// 예시
clientId: '123456789-abcdefghijklmnop.apps.googleusercontent.com',
```

### 2.3 앱 스킴 설정
`app.json` 파일에 스킴 추가:
```json
{
  "expo": {
    "scheme": "hometownon",
    "android": {
      "package": "com.yourcompany.hometownon"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.hometownon"
    }
  }
}
```

## 3. 필요한 API 활성화

Google Cloud Console에서 다음 API들을 활성화해야 합니다:

1. **Google+ API** (사용자 정보 가져오기용)
2. **Google Identity API**

## 4. 테스트

### 4.1 개발 환경에서 테스트
```bash
expo start
```

### 4.2 실제 기기에서 테스트
```bash
expo start --tunnel
```

## 5. 보안 고려사항

1. **클라이언트 ID는 공개되어도 안전**하지만, 클라이언트 시크릿은 절대 공개하지 마세요.
2. **프로덕션 환경**에서는 적절한 도메인 제한을 설정하세요.
3. **OAuth 동의 화면**에서 필요한 스코프만 요청하세요.

## 6. 문제 해결

### 6.1 일반적인 오류
- **"redirect_uri_mismatch"**: 승인된 리디렉션 URI 확인
- **"invalid_client"**: 클라이언트 ID 확인
- **"access_denied"**: OAuth 동의 화면 설정 확인

### 6.2 디버깅
```javascript
// 콘솔에서 리디렉션 URI 확인
console.log(AuthSession.makeRedirectUri({
  scheme: 'hometownon',
}));
```

## 7. 추가 리소스

- [Expo AuthSession 문서](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [React Navigation 문서](https://reactnavigation.org/)
