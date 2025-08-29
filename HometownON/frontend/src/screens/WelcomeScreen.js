import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9C4" />
      
      

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Logo Image */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/splash_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* App Title */}
        <Text style={styles.appTitle}>고향으로 ON</Text>
        
        {/* Welcome Message */}
        <Text style={styles.welcomeMessage}>
          고향으로ON에 오신 여러분{'\n'}
          진심으로 환영합니다!
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.signInButtonText}>Signin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    width: 20,
    height: 12,
    backgroundColor: '#000',
    marginRight: 5,
    borderRadius: 2,
  },
  wifiIcon: {
    width: 16,
    height: 12,
    backgroundColor: '#000',
    marginRight: 5,
    borderRadius: 2,
  },
  batteryIcon: {
    width: 24,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoImage: {
    width: 250,
    height: 250,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingBottom: 50,
    gap: 15,
  },
  signUpButton: {
    flex: 1,
    backgroundColor: '#424242',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    flex: 1,
    backgroundColor: '#FFF9C4',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  signInButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
