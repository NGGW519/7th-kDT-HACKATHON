import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

/**
 * @typedef {object} RootStackParamList
 * @property {undefined} HomeMain - 메인 홈 화면.
 * @property {undefined} ResidentScreen - 지역 주민 화면.
 * @property {{ categoryId: number; categoryName: string }} PostListScreen - 게시글 목록 화면.
 */
type RootStackParamList = {
  HomeMain: undefined;
  ResidentScreen: undefined;
  PostListScreen: { categoryId: number; categoryName: string };
};

/**
 * @typedef {object} TabParamList
 * @property {undefined} 미션 - 미션 탭.
 * @property {{ screen: string; params: { categoryId: number; categoryName: string } }} 게시판 - 게시판 탭.
 * @property {undefined} 홈 - 홈 탭.
 * @property {undefined} 임시 - 임시 탭.
 * @property {undefined} 마이페이지 - 마이페이지 탭.
 */
type TabParamList = {
  미션: undefined;
  게시판: { screen: string; params: { categoryId: number; categoryName: string } };
  홈: undefined;
  임시: undefined;
  마이페이지: undefined;
};

/**
 * @typedef {CompositeNavigationProp<StackNavigationProp<RootStackParamList, 'ResidentScreen'>, BottomTabNavigationProp<TabParamList>>} ResidentScreenNavigationProp
 * @description ResidentScreen의 내비게이션 속성 타입 정의.
 */
type ResidentScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'ResidentScreen'>,
  BottomTabNavigationProp<TabParamList>
>;

/**
 * @interface ResidentScreenProps
 * @description ResidentScreen 컴포넌트의 props 타입을 정의합니다.
 * @property {ResidentScreenNavigationProp} navigation - 내비게이션 객체.
 */
interface ResidentScreenProps {
  navigation: ResidentScreenNavigationProp;
}

/**
 * @function ResidentScreen
 * @description 지역 주민을 위한 메인 화면 컴포넌트.
 * 의뢰자 게시판으로 이동하는 기능과 과거 의뢰 내역을 표시합니다.
 * @param {ResidentScreenProps} props - 컴포넌트 props.
 */
export default function ResidentScreen({ navigation }: ResidentScreenProps) {
  // console.log('ResidentScreen navigation prop:', navigation);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 상단 인사말 */}
      <View style={styles.header}>
        {/* <Image source={require('./assets/profile.png')} style={styles.profileImg} /> */}
        <View>
          <Text style={styles.greeting}>지역주민님 안녕하세요.</Text>
          <Text style={styles.subGreeting}>Welcome to Buddy</Text>
        </View>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      <View style={styles.banner}>
      {/* 왼쪽: 텍스트 + 버튼 */}
        <View style={styles.bannerTextArea}>
          <Text style={styles.bannerTitle}>의뢰자 게시판</Text>
          <Text style={styles.bannerDesc}>의뢰하신 일에 대해 많은 전문가들이 관심을 가지고 있습니다!</Text>
          <TouchableOpacity style={styles.bannerButton} onPress={() => {
            console.log('Navigating to PostListScreen within HomeStack');
            navigation.push('PostListScreen', { categoryId: 2, categoryName: '의뢰 게시판' }); // Changed to push and categoryId 2
          }}>
            <Text style={styles.buttonText}>바로가기</Text>
          </TouchableOpacity>
        </View>

      {/* 오른쪽: 강아지 이미지 */}
      <Image source={require('../../../assets/images/mission_assistant.png')} style={styles.dogImg} /></View>


      {/* 과거 의뢰내역 */}
      <Text style={styles.historyTitle}>과거의뢰내역</Text>

      <View style={styles.card}>
        {/* <Image source={require('./assets/user1.png')} style={styles.avatar} /> */}
        <View style={styles.info}>
          <Text style={styles.name}>귀도 판 로썸</Text>
          <Text style={styles.detail}>Python 전문가</Text>
        </View>
        <Image source={require('../../../assets/images/매칭성공_체크표시.png')} style={styles.statusIcon} />
        <Text style={styles.statusText}>매칭 완료</Text>
      </View>

      <View style={styles.card}>
        {/* <Image source={require('./assets/user2.png')} style={styles.avatar} /> */}
        <View style={styles.info}>
          <Text style={styles.name}>귀뚜라미</Text>
          <Text style={styles.detail}>보일러 수리공</Text>
        </View>
        <Image source={require('../../../assets/images/매칭성공_체크표시.png')} style={styles.statusIcon} />
        <Text style={styles.statusText}>매칭 완료</Text>
      </View>

      <View style={styles.card}>
        {/* <Image source={require('./assets/user3.png')} style={styles.avatar} /> */}
        <View style={styles.info}>
          <Text style={styles.name}>우삐삐</Text>
          <Text style={styles.detail}>여행 가이드</Text>
        </View>
        <Image source={require('../../../assets/images/매칭실패_x표시.png')} style={styles.statusIcon} />
        <Text style={[styles.statusText, { color: 'red' }]}>매칭 실패</Text>
      </View>
    </ScrollView>
  );
}

import { styles } from './ResidentScreen.styles';