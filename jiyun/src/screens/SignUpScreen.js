import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';

const SignUpScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>회원가입</Text>
      </View>

      {/* User Type Cards */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* 귀향자 (Returnee) Card */}
        <TouchableOpacity
          style={[styles.card, styles.returneeCard]}
          onPress={() => navigation.navigate('ReturneeSignUp')}
        >
          <View style={styles.cardContent}>
            <View style={styles.characterContainer}>
              <Image 
                source={require('../assets/images/회원가입_귀향자.png')}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>귀향자</Text>
              <Text style={styles.cardDescription}>
                고향에 다시 돌아왔어요!{'\n'} 
                고향에서 당신의 새로운 꿈을{'\n'} 
                응원합니다!
              </Text>
              <TouchableOpacity
                style={[styles.cardButton, styles.returneeButton]}
                onPress={() => navigation.navigate('ReturneeSignUp')}
              >
                <Text style={styles.cardButtonText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* 지역주민 (Local Resident) Card */}
        <TouchableOpacity
          style={[styles.card, styles.residentCard]}
          onPress={() => navigation.navigate('ResidentSignUp')}
        >
          <View style={styles.cardContent}>
            <View style={styles.characterContainer}>
              <Image 
                source={require('../assets/images/회원가입_지역주민.png')}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>지역주민</Text>
              <Text style={styles.cardDescription}>
                지역에서 도움이 필요한{'\n'} 
                모든 일들을 전문가에게{'\n'} 
                의뢰합니다!
              </Text>
              <TouchableOpacity
                style={[styles.cardButton, styles.residentButton]}
                onPress={() => navigation.navigate('ResidentSignUp')}
              >
                <Text style={styles.cardButtonText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* 멘토 (Mentor) Card */}
        <TouchableOpacity
          style={[styles.card, styles.mentorCard]}
          onPress={() => navigation.navigate('MentorSignUp')}
        >
          <View style={styles.cardContent}>
            <View style={styles.characterContainer}>
              <Image 
                source={require('../assets/images/회원가입_멘토.png')}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>멘토</Text>
              <Text style={styles.cardDescription}>
                경력을 전환하고 싶으신가요?{'\n'} 
                귀향자분들의 멘토가{'\n'} 
                되어드릴게요! 저를 찾아주세요!
              </Text>
              <TouchableOpacity
                style={[styles.cardButton, styles.mentorButton]}
                onPress={() => navigation.navigate('MentorSignUp')}
              >
                <Text style={styles.cardButtonText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'visible',
  },
  returneeCard: {
    backgroundColor: '#FF9800',
  },
  residentCard: {
    backgroundColor: '#9C27B0',
  },
  mentorCard: {
    backgroundColor: '#4CAF50',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterContainer: {
    marginRight: 20,
  },
  characterImage: {
    width: 120,
    height: 160,
    marginRight: -20,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 15,
  },
  cardButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  returneeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  residentButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mentorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUpScreen;
