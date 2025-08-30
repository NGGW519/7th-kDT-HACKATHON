import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyMenu = ({ onAIChatbot, onMissionDashboard, onFindEducation, onBoard, onExplorationMission, onTestMap, onTestAPI, onTestSignUp }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState(['ai', 'mission', 'education']);
  const [availableMenus, setAvailableMenus] = useState([
    { key: 'ai', title: 'AI chatbot', icon: '🤖', handler: onAIChatbot, subLabel: '챗봇 바로가기' },
    { key: 'mission', title: '미션 대시보드', icon: '📊', handler: onMissionDashboard },
    { key: 'education', title: '교육/멘토 찾기', icon: '💡', handler: onFindEducation },
    { key: 'board', title: '게시판', icon: '📋', handler: onBoard },
    { key: 'exploration', title: '탐색형 미션', icon: '🗺️', handler: onExplorationMission, subLabel: '지도로 탐색하기' },
    { key: 'testmap', title: '지도 테스트', icon: '🧪', handler: onTestMap, subLabel: '지도 기능 테스트' },
    { key: 'testapi', title: 'API 연결 테스트', icon: '🔗', handler: onTestAPI, subLabel: '백엔드 연결 확인' },
    { key: 'testsignup', title: '회원가입 API 테스트', icon: '👤', handler: onTestSignUp, subLabel: '회원가입 API 확인' },
  ]);

  useEffect(() => {
    loadMenuSettings();
  }, []);

  const loadMenuSettings = async () => {
    try {
      const savedMenus = await AsyncStorage.getItem('myMenuSettings');
      if (savedMenus) {
        setSelectedMenus(JSON.parse(savedMenus));
      }
    } catch (error) {
      console.error('메뉴 설정 로드 오류:', error);
    }
  };

  const saveMenuSettings = async (menus) => {
    try {
      await AsyncStorage.setItem('myMenuSettings', JSON.stringify(menus));
    } catch (error) {
      console.error('메뉴 설정 저장 오류:', error);
    }
  };

  const handleMenuToggle = (menuKey) => {
    const newSelectedMenus = [...selectedMenus];
    const index = newSelectedMenus.indexOf(menuKey);
    
    if (index > -1) {
      // 메뉴 제거
      newSelectedMenus.splice(index, 1);
    } else {
      // 메뉴 추가 (최대 3개)
      if (newSelectedMenus.length >= 3) {
        Alert.alert('알림', '최대 3개까지만 선택할 수 있습니다.');
        return;
      }
      newSelectedMenus.push(menuKey);
    }
    
    setSelectedMenus(newSelectedMenus);
    saveMenuSettings(newSelectedMenus);
  };

  const getSelectedMenuItems = () => {
    return availableMenus.filter(menu => selectedMenus.includes(menu.key));
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>마이메뉴</Text>
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.arrowText}>설정</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuGrid}>
        {getSelectedMenuItems().map((menu) => (
          <TouchableOpacity 
            key={menu.key}
            style={styles.menuCard} 
            onPress={menu.handler}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{menu.icon}</Text>
            </View>
            <Text style={styles.menuLabel}>{menu.title}</Text>
            {menu.subLabel && (
              <Text style={styles.menuSubLabel}>{menu.subLabel}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>마이메뉴 설정</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              원하는 메뉴를 선택하세요 (최대 3개)
            </Text>
            
            <View style={styles.settingsGrid}>
              {availableMenus.map((menu) => (
                <TouchableOpacity
                  key={menu.key}
                  style={[
                    styles.settingItem,
                    selectedMenus.includes(menu.key) && styles.settingItemSelected
                  ]}
                  onPress={() => handleMenuToggle(menu.key)}
                >
                  <View style={styles.settingIconContainer}>
                    <Text style={styles.settingIcon}>{menu.icon}</Text>
                  </View>
                  <Text style={[
                    styles.settingTitle,
                    selectedMenus.includes(menu.key) && styles.settingTitleSelected
                  ]}>
                    {menu.title}
                  </Text>
                  {selectedMenus.includes(menu.key) && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalFooter}>
              <Text style={styles.selectedCount}>
                선택된 메뉴: {selectedMenus.length}/3
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 13,
    color: '#6956E5',
    fontWeight: '600',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  settingItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  settingItemSelected: {
    backgroundColor: '#6956E5',
    borderColor: '#6956E5',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  settingTitleSelected: {
    color: '#FFF',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    backgroundColor: '#28a745',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalFooter: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});

export default MyMenu;
