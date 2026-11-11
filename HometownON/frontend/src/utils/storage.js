import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 데이터를 임시로 저장하는 키
const USERS_KEY = 'users_data';

// 기기에 저장하면 안 되는 키 (비밀번호는 서버만 보관한다)
// 로그인 토큰은 AsyncStorage 'access_token' 키에만 둔다. 사용자 캐시에는 넣지 않는다.
const SENSITIVE_KEYS = [
  'password', 'confirmPassword',
  'token', 'access_token', 'accessToken', 'refresh_token', 'refreshToken', 'idToken',
];

// 화면에서 폼 데이터를 저장 객체에 펼칠 때 쓴다: ...withoutPasswords(formData)
export const withoutPasswords = (obj) => stripSensitive(obj);

const stripSensitive = (user) => {
  if (!user || typeof user !== 'object') return user;
  const clean = { ...user };
  SENSITIVE_KEYS.forEach((k) => { delete clean[k]; });
  return clean;
};

// 이미 저장돼 있던 사용자 목록·현재 사용자에서 비밀번호·토큰 필드를 지운다.
// 진행 중인 정리를 Promise 로 공유해서, 동시에 여러 번 불려도 한 번만 돌고 모두 끝나길 기다린다.
// 성공으로 끝난 뒤에만 '정리됨' 이 되고, 실패하면 다음 호출에서 다시 시도한다.
let purgePromise = null;
export const purgeStoredPasswords = () => {
  if (!purgePromise) {
    purgePromise = (async () => {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(list.map(stripSensitive)));
        }
      }
      const cur = await AsyncStorage.getItem('current_user');
      if (cur) {
        await AsyncStorage.setItem('current_user', JSON.stringify(stripSensitive(JSON.parse(cur))));
      }
    })().catch((error) => {
      purgePromise = null;
      console.error('저장된 비밀번호 정리 오류:', error);
    });
  }
  return purgePromise;
};

// 사용자 데이터 저장
export const updateUserAndSave = async (rawUserData) => {
  try {
    await purgeStoredPasswords();
    const userData = stripSensitive(rawUserData);
    let existingUsers = await getUsers();
    const userIndex = existingUsers.findIndex(u => u.id === userData.id);

    if (userIndex > -1) {
      // Update existing user
      existingUsers[userIndex] = { ...existingUsers[userIndex], ...userData };
    } else {
      // Add new user (if no ID or new user)
      existingUsers.push(userData);
    }

    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));
    await saveCurrentUser(userData); // Update current user in AsyncStorage
    return true;
  } catch (error) {
    console.error('사용자 업데이트 및 저장 오류:', error);
    return false;
  }
};

// 모든 사용자 데이터 가져오기
export const getUsers = async () => {
  try {
    await purgeStoredPasswords();
    const users = await AsyncStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('사용자 데이터 가져오기 오류:', error);
    return [];
  }
};

// 사용자 로그인 확인
export const authenticateUser = async (email, password) => {
  try {
    // 비밀번호는 기기에 저장하지 않으므로 기기 저장소로는 로그인할 수 없다.
    // 로그인은 AuthService.signIn(서버)을 쓴다.
    return null;
  } catch (error) {
    console.error('로그인 확인 오류:', error);
    return null;
  }
};

// 이메일 중복 확인
export const isEmailExists = async (email) => {
  try {
    const users = await getUsers();
    return users.some(user => user.email === email);
  } catch (error) {
    console.error('이메일 중복 확인 오류:', error);
    return false;
  }
};

// 현재 로그인된 사용자 저장
export const saveCurrentUser = async (user) => {
  try {
    await purgeStoredPasswords();
    await AsyncStorage.setItem('current_user', JSON.stringify(stripSensitive(user)));
    return true;
  } catch (error) {
    console.error('현재 사용자 저장 오류:', error);
    return false;
  }
};

// 현재 로그인된 사용자 가져오기
export const getCurrentUser = async () => {
  try {
    await purgeStoredPasswords();
    const user = await AsyncStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('현재 사용자 가져오기 오류:', error);
    return null;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('current_user');
    await AsyncStorage.removeItem('access_token');
    return true;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return false;
  }
};
