import { StyleSheet } from 'react-native';

/**
 * @constant styles
 * @description MainScreen 컴포넌트의 스타일 정의.
 */
export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 16, paddingBottom: 100 }, // 버튼 공간 확보
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -20,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25 },
  welcomeText: { fontSize: 16, fontWeight: 'bold', marginTop: -10 },
  subText: { fontSize: 12, color: 'gray' },
  levelBadge: { width: 60, height: 60, marginLeft: 'auto', resizeMode: 'contain' },

  aiCard: {
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  AiImage: { width: 20, height: 20, resizeMode: 'contain' },
  aiContent: { fontSize: 13 },

  missionBox: {
    backgroundColor: '#F6D094',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  dogImage: {
    width: 180,
    height: 180,
    marginLeft: -40,
    marginTop: -24,
    marginBottom: -40,
    resizeMode: 'contain',
  },
  missionText: { fontWeight: 'bold', marginBottom: 4, marginRight: 12 },
  missionButton: {
    marginTop: 8,
    backgroundColor: '#FF9900',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },

  badgeBox: { marginTop: 20 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  smallText: { fontSize: 12, color: 'gray' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  badge: { width: 30, height: 30 },

  chartSection: { marginTop: 24 },
  chartInfo: { gap: 4, justifyContent: 'center' },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  chartWrapper: { marginTop: -12 },
  testBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testLoginButton: {
    backgroundColor: '#007bff', // 파란색 배경
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  testLoginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  residentButton: {
    backgroundColor: '#28a745', // 녹색 계열
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    width: '100%',
  },
  residentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});