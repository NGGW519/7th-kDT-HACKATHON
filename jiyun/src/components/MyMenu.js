import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const MyMenu = ({ onAIChatbot, onMissionDashboard, onFindEducation, onBoard }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>마이메뉴</Text>
        <TouchableOpacity style={styles.arrowButton}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuGrid}>
        <TouchableOpacity style={styles.menuCard} onPress={onAIChatbot}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🤖</Text>
          </View>
          <Text style={styles.menuLabel}>AI chatbot</Text>
          <Text style={styles.menuSubLabel}>챗봇 바로가기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuCard} onPress={onMissionDashboard}>
          <View style={styles.iconContainer}>
            <Text style={styles.dashboardIcon}>📊</Text>
          </View>
          <Text style={styles.menuLabel}>미션 대시보드</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuCard} onPress={onFindEducation}>
          <View style={styles.iconContainer}>
            <Text style={styles.educationIcon}>💡</Text>
          </View>
          <Text style={styles.menuLabel}>교육/멘토 찾기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuCard} onPress={onBoard}>
          <View style={styles.iconContainer}>
            <Text style={styles.boardIcon}>📋</Text>
          </View>
          <Text style={styles.menuLabel}>게시판</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  menuGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  menuCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 100,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 30,
  },
  dashboardIcon: {
    fontSize: 30,
  },
  educationIcon: {
    fontSize: 30,
  },
  boardIcon: {
    fontSize: 30,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  menuSubLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default MyMenu;
