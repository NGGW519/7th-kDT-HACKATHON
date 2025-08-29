import { StyleSheet } from 'react-native';

/**
 * @constant styles
 * @description ResidentScreen 컴포넌트의 스타일 정의.
 */
export const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: 'gray',
    fontSize: 12,
  },
  menuIcon: {
    fontSize: 24,
    color: '#666',
  },

  bannerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bannerDesc: {
    color: '#fff',
    marginTop: 8,
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  dogImg: {
  width: 180,                // ✅ 크기 키우기
  height: 180,
  marginRight: -40,           
  marginTop: -20,            
  marginBottom: -150,        
  resizeMode: 'contain',     
},

banner: {
  backgroundColor: '#7D4EFF',
  padding: 16,
  borderRadius: 12,
  marginBottom: 24,
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  overflow: 'visible',       // ✅ 박스 밖 이미지 허용!
  position: 'relative',      // ✅ (안전하게 배치 기준)
},

bannerTextArea: {
  flex: 1,
  paddingRight: 12,
},


  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  detail: {
    fontSize: 12,
    color: 'gray',
  },
  statusIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  statusText: {
    fontWeight: 'bold',
  },
});