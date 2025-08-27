import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

const MentorMainScreen = ({ navigation }) => {
  // 임시 데이터
  const students = [
    { id: 1, name: '김철수', course: 'IT 프로그래밍', progress: '진행중' },
    { id: 2, name: '이영희', course: '농업 기술', progress: '완료' },
    { id: 3, name: '박민수', course: '요리 기술', progress: '진행중' },
  ];

  const courses = [
    { id: 1, title: 'IT 프로그래밍 기초', students: 5, status: '진행중' },
    { id: 2, title: '농업 기술 실습', students: 3, status: '진행중' },
    { id: 3, title: '요리 기초 과정', students: 2, status: '완료' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>고향으로 ON</Text>
        <Text style={styles.headerSubtitle}>멘토 메인</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Quick Access Button */}
        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('MentorBoard')}
        >
          <Text style={styles.quickAccessButtonText}>멘토 게시판 바로가기</Text>
        </TouchableOpacity>

        {/* Students Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수강생 리스트</Text>
          
          {students.map((student) => (
            <View key={student.id} style={styles.studentItem}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentCourse}>{student.course}</Text>
              </View>
              <View style={[
                styles.progressBadge,
                student.progress === '완료' ? styles.progressCompleted : styles.progressInProgress,
              ]}>
                <Text style={styles.progressText}>{student.progress}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Courses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수업 목차</Text>
          
          {courses.map((course) => (
            <View key={course.id} style={styles.courseItem}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseStudents}>수강생: {course.students}명</Text>
              </View>
              <View style={[
                styles.statusBadge,
                course.status === '완료' ? styles.statusCompleted : styles.statusInProgress,
              ]}>
                <Text style={styles.statusText}>{course.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('NewCourse')}
          >
            <Text style={styles.actionButtonText}>새 수업 등록</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyCourses')}
          >
            <Text style={styles.actionButtonText}>내 수업 관리</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quickAccessButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickAccessButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  studentCourse: {
    fontSize: 14,
    color: '#666',
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  progressInProgress: {
    backgroundColor: '#FFF3E0',
  },
  progressCompleted: {
    backgroundColor: '#E8F5E8',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  courseStudents: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusInProgress: {
    backgroundColor: '#FFF3E0',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  actionButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MentorMainScreen;
