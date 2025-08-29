import { StyleSheet } from 'react-native';

/**
 * @constant styles
 * @description PostDetailScreen 컴포넌트의 스타일 정의.
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
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
  },
  postDate: {
    fontSize: 14,
    color: '#666',
  },
  postLikeButton: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  commentsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  commentsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  commentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  replyCommentItem: {
    marginLeft: 20,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 3,
    borderLeftColor: '#ddd',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  commentLikeButton: {
    fontSize: 13,
    color: '#007bff',
  },
  commentReplyButton: {
    fontSize: 13,
    color: '#28a745',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  commentSubmitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  commentSubmitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    paddingRight: 5,
  },
  emptyCommentText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
});