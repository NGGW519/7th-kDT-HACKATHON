import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 데이터를 임시로 저장하는 키
const USERS_KEY = 'users_data';

// 사용자 데이터 저장
export const updateUserAndSave = async (userData) => {
  try {
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
    const users = await getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
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
    await AsyncStorage.setItem('current_user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('현재 사용자 저장 오류:', error);
    return false;
  }
};

// 현재 로그인된 사용자 가져오기
export const getCurrentUser = async () => {
  try {
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
    return true;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return false;
  }
};
