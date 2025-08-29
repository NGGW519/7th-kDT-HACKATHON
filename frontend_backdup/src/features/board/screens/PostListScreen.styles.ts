import { StyleSheet } from 'react-native';

/**
 * @constant styles
 * @description PostListScreen 컴포넌트의 스타일 정의.
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  postList: {
    paddingHorizontal: 10,
  },
  postItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
  },
  postDate: {
    fontSize: 14,
    color: '#666',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  writeButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pagingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  pagingButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  pagingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});