import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

const GoalSettingScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: '10번의 의뢰를 수행하고 신뢰 배지 받기',
      description: '총 10건의 의뢰를 완료하여 신뢰받는 기술자 배지를 획득',
      target: 10,
      current: 8,
      type: 'requests',
      deadline: '2024.12.31',
      completed: false,
    },
    {
      id: 2,
      title: '월 수익 50만원 달성하기',
      description: '한 달에 50만원의 수익을 달성하여 안정적인 수입 확보',
      target: 500000,
      current: 240000,
      type: 'earnings',
      deadline: '2024.12.31',
      completed: false,
    },
    {
      id: 3,
      title: '고객 만족도 5점 달성하기',
      description: '모든 의뢰에서 5점 만점의 고객 만족도 받기',
      target: 5,
      current: 4.8,
      type: 'satisfaction',
      deadline: '2024.12.31',
      completed: false,
    },
  ]);

  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4CAF50';
    if (progress >= 70) return '#FF9800';
    if (progress >= 40) return '#2196F3';
    return '#F44336';
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoalTitle(goal.title);
    setNewGoalDescription(goal.description);
    setNewGoalTarget(goal.target.toString());
  };

  const handleSaveGoal = () => {
    if (!newGoalTitle.trim() || !newGoalDescription.trim() || !newGoalTarget.trim()) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    const targetValue = parseFloat(newGoalTarget);
    if (isNaN(targetValue) || targetValue <= 0) {
      Alert.alert('오류', '올바른 목표값을 입력해주세요.');
      return;
    }

    setGoals(prev => prev.map(goal => 
      goal.id === editingGoal.id 
        ? {
            ...goal,
            title: newGoalTitle,
            description: newGoalDescription,
            target: targetValue,
          }
        : goal
    ));

    setEditingGoal(null);
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalTarget('');
  };

  const handleDeleteGoal = (goalId) => {
    Alert.alert(
      '목표 삭제',
      '이 목표를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setGoals(prev => prev.filter(goal => goal.id !== goalId));
          },
        },
      ]
    );
  };

  const handleAddGoal = () => {
    if (!newGoalTitle.trim() || !newGoalDescription.trim() || !newGoalTarget.trim()) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    const targetValue = parseFloat(newGoalTarget);
    if (isNaN(targetValue) || targetValue <= 0) {
      Alert.alert('오류', '올바른 목표값을 입력해주세요.');
      return;
    }

    const newGoal = {
      id: Date.now(),
      title: newGoalTitle,
      description: newGoalDescription,
      target: targetValue,
      current: 0,
      type: 'custom',
      deadline: '2024.12.31',
      completed: false,
    };

    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalTarget('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>목표 설정</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add New Goal Section */}
        <View style={styles.addGoalSection}>
          <Text style={styles.sectionTitle}>🎯 새 목표 추가</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="목표 제목"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="목표 설명"
              value={newGoalDescription}
              onChangeText={setNewGoalDescription}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="목표값 (숫자)"
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
              <Text style={styles.addButtonText}>목표 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>📋 현재 목표</Text>
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current, goal.target);
            const progressColor = getProgressColor(progress);
            
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View style={styles.goalActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEditGoal(goal)}
                    >
                      <Text style={styles.actionText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteGoal(goal.id)}
                    >
                      <Text style={styles.actionText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.goalDescription}>{goal.description}</Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {goal.current} / {goal.target}
                    </Text>
                    <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${progress}%`, backgroundColor: progressColor }
                      ]} 
                    />
                  </View>
                </View>
                
                <Text style={styles.deadlineText}>마감일: {goal.deadline}</Text>
              </View>
            );
          })}
        </View>

        {/* Edit Goal Modal */}
        {editingGoal && (
          <View style={styles.editModal}>
            <View style={styles.editModalContent}>
              <Text style={styles.editModalTitle}>목표 수정</Text>
              <TextInput
                style={styles.input}
                placeholder="목표 제목"
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="목표 설명"
                value={newGoalDescription}
                onChangeText={setNewGoalDescription}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="목표값 (숫자)"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
                keyboardType="numeric"
              />
              <View style={styles.editModalActions}>
                <TouchableOpacity 
                  style={[styles.editModalButton, styles.cancelButton]}
                  onPress={() => setEditingGoal(null)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editModalButton, styles.saveButton]}
                  onPress={handleSaveGoal}
                >
                  <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6956E5',
  },
  headerSafeArea: {
    backgroundColor: '#6956E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#6956E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  addGoalSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
  },
  addButton: {
    backgroundColor: '#6956E5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalsSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#6956E5',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  actionText: {
    fontSize: 16,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6956E5',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  deadlineText: {
    fontSize: 12,
    color: '#999',
  },
  editModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  editModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  editModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6956E5',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GoalSettingScreen;
