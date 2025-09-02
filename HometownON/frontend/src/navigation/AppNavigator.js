
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createStackNavigator } from '@react-navigation/stack';
import { Image } from 'react-native';

// Import screens
import AchievementScreen from '../screens/AchievementScreen';
// import BoardDetailScreen from '../screens/BoardDetailScreen';
// import BoardScreen from '../screens/BoardScreen';
// import BoardWriteScreen from '../screens/BoardWriteScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
// import FreeBoardScreen from '../screens/FreeBoardScreen';
// import FreeBoardWriteScreen from '../screens/FreeBoardWriteScreen';
import GoalSettingScreen from '../screens/GoalSettingScreen';
import HelpScreen from '../screens/HelpScreen';
// import MentorBoardScreen from '../screens/MentorBoardScreen';
// import MentorDetailScreen from '../screens/MentorDetailScreen';
// import MentorMainScreen from '../screens/MentorMainScreen';
import MentorSeekingWriteScreen from '../screens/MentorSeekingWriteScreen';
import MentorSignUpScreen from '../screens/MentorSignUpScreen';
import MessengerScreen from '../screens/MessengerScreen';
import MissionCardGameScreen from '../screens/MissionCardGameScreen';
import MissionDashboardScreen from '../screens/MissionDashboardScreen';
import MissionDetailScreen from '../screens/MissionDetailScreen';
import MissionListScreen from '../screens/MissionListScreen';
import MissionLoadingScreen from '../screens/MissionLoadingScreen';
import MyPageScreen from '../screens/MyPageScreen';
import NotificationScreen from '../screens/NotificationScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import RequestBoardScreen from '../screens/RequestBoardScreen';

import ResidentMyPageScreen from '../screens/ResidentMyPageScreen';
import ResidentSignUpScreen from '../screens/ResidentSignUpScreen';
import ReturneeMainScreen from '../screens/ReturneeMainScreen';
import ReturneeSignUpScreen from '../screens/ReturneeSignUpScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

// ----박현아----//

//멘토

//홈 화면
import CourseEditorScreen from "../screens/CourseEditorScreen";
import CreateClassScreen from "../screens/CreateClassScreen";
import MentorMainScreen from "../screens/MentorMainScreen";
import MentorNotificationScreen from "../screens/MentorNotificationScreen";
import MyStudentsScreen from "../screens/MyStudentsScreen";
import StudentDetailScreen from "../screens/StudentDetailScreen";

//의뢰 현황
import MentorMessengerChatScreen from "../screens/MentorMessengerChatScreen";
import MentorRequestStatusScreen from "../screens/MentorRequestStatusScreen";

//게시판
import BoardDetailScreen from "../screens/BoardDetailScreen";
import BoardScreen from "../screens/BoardScreen";
import BoardWriteScreen from "../screens/BoardWriteScreen";
import ChatDetailScreen from "../screens/ChatDetailScreen";
import FreeBoardScreen from "../screens/FreeBoardScreen";
import FreeBoardWriteScreen from "../screens/FreeBoardWriteScreen";
import MentorBoardScreen from "../screens/MentorBoardScreen";
import MentorBoardWriteScreen from "../screens/MentorBoardWriteScreen";
import MentorDetailScreen from "../screens/MentorDetailScreen";

// 채팅 
import MessengerChatScreen from "../screens/MessengerChatScreen";
import TabMessengerScreen from "../screens/TabMessengerScreen";

//마이페이지
import MentorEditProfileScreen from "../screens/MentorEditProfileScreen";
import MentorHelp from "../screens/MentorHelp";
import MentorMyPageScreen from "../screens/MentorMyPageScreen";
import MentorSettingsScreen from "../screens/MentorSettingsScreen";

// 지역주민 

// 홈 화면
import MyActiveRequestsScreen from "../screens/MyActiveRequestsScreen";
import MyAllRequestsScreen from "../screens/MyAllRequestsScreen";
import ResidentMainScreen from '../screens/ResidentMainScreen';
import ResMessengerChatScreen from "../screens/ResMessengerChatScreen";
import ResNotificationScreen from "../screens/ResNotificationScreen";

// 의뢰 현황
import ResRequestStatusScreen from "../screens/ResRequestStatusScreen";
// 채팅 화면 동일

//게시판
//멘토와 동일

//채팅
//멘도와 동일

// 마이페이지
import ResEditProfileScreen from "../screens/ResEditProfileScreen";
import ResHelp from "../screens/ResHelp";
import ResMyPageScreen from "../screens/ResMyPageScreen";
import ResSettingsScreen from "../screens/ResSettingsScreen";



const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// 귀향자 탭 네비게이터
function ReturneeBoardStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BoardHome" component={BoardScreen} />
      <Stack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <Stack.Screen name="MentorBoard" component={MentorBoardScreen} />
      <Stack.Screen name="MentorDetail" component={MentorDetailScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="FreeBoard" component={FreeBoardScreen} />
      <Stack.Screen name="FreeBoardWriteScreen" component={FreeBoardWriteScreen} />
      <Stack.Screen name="MessengerChatScreen" component={MessengerChatScreen} />
      <Stack.Screen name="MentorBoardWriteScreen" component={MentorBoardWriteScreen} />
      <Stack.Screen name="BoardWriteScreen" component={BoardWriteScreen} />
    </Stack.Navigator>
  );
}

const returneeTabBarStyle = {
  backgroundColor: '#FFF',
  borderTopWidth: 1,
  borderTopColor: '#E0E0E0',
  paddingBottom: 5,
  paddingTop: 5,
  height: 60,
};

const ReturneeTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: returneeTabBarStyle,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ReturneeMain"
        component={ReturneeMainScreen}
        options={{
          tabBarLabel: '메인',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/home.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MissionStatus"
        component={MissionListScreen}
        options={{
          tabBarLabel: '미션현황',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/mission.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />


      <Tab.Screen
        name="Board"
        component={ReturneeBoardStackScreen}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "BoardHome";
          const shouldHide =
            routeName === "ChatDetail" ||
            routeName === "BoardDetail" ||
            routeName === "MentorDetail" ||
            routeName === "RegistrationForm" ||
            routeName === "FreeBoardWriteScreen" ||
            routeName === "BoardWriteScreen" ||
            routeName === "MentorBoardWriteScreen";
          return {
            tabBarLabel: "게시판",
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require("../assets/images/board.png")}
                style={{ width: size, height: size, tintColor: color }}
                resizeMode="contain"
              />
            ),
            tabBarStyle: shouldHide ? { display: "none" } : returneeTabBarStyle,
          };
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarLabel: '챗봇',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/chatbot-1.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이페이지',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assets/images/settings.png')} 
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// -- 박현아 -- //

const ResMessengerStack = createNativeStackNavigator();
const ResBoardStack = createNativeStackNavigator();
const ResMypageStack = createNativeStackNavigator();
const ResJobsStack = createNativeStackNavigator();
const ResHomeStack = createNativeStackNavigator();

function ResHomeStackScreen() {
  return (
    <ResHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <ResHomeStack.Screen name = "ResidentMainScreen" component={ResidentMainScreen}/>
      <ResHomeStack.Screen name = "ResNotificationScreen" component={ResNotificationScreen}/>
      <ResHomeStack.Screen name = "MyActiveRequestsScreen" component={MyActiveRequestsScreen} />
      <ResHomeStack.Screen name = "ResMessengerChatScreen" component={ResMessengerChatScreen} />
      <ResHomeStack.Screen name = "MyAllRequestsScreen" component={MyAllRequestsScreen} />
    </ResHomeStack.Navigator>
  );
}

function ResJobsStackScreen() {
  return (
    <ResJobsStack.Navigator screenOptions={{ headerShown: false }}>
      <ResJobsStack.Screen name="ResRequestStatusScreen" component={ResRequestStatusScreen} />
      <ResJobsStack.Screen name="ResMessengerChatScreen" component={ResMessengerChatScreen} />
    </ResJobsStack.Navigator>
  );
}

function ResBoardStackScreen() {
  return (
    <ResBoardStack.Navigator screenOptions={{ headerShown: false }}>
      <ResBoardStack.Screen name="BoardHome" component={BoardScreen} />
      <ResBoardStack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <ResBoardStack.Screen name="MentorBoard" component={MentorBoardScreen} />
      <ResBoardStack.Screen name="MentorDetail" component={MentorDetailScreen} />
      <ResBoardStack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <ResBoardStack.Screen name="FreeBoard" component={FreeBoardScreen} />
      <ResBoardStack.Screen name="FreeBoardWriteScreen" component={FreeBoardWriteScreen} />
      <ResBoardStack.Screen name="MessengerChatScreen" component={MessengerChatScreen} />
      <ResBoardStack.Screen name="MentorBoardWriteScreen" component={MentorBoardWriteScreen} />
      <ResBoardStack.Screen name="BoardWriteScreen" component={BoardWriteScreen} />
    </ResBoardStack.Navigator>
  );
}


function ResMessengerStackScreen() {
  return (
    <ResMessengerStack.Navigator screenOptions={{ headerShown: false }}>
      <ResMessengerStack.Screen name="MessengerHome" component={TabMessengerScreen} />
      <ResMessengerStack.Screen name="MessengerChatScreen" component={MessengerChatScreen} />
    </ResMessengerStack.Navigator>
  );
}

function ResMyPageStackScreen() {
  return (
    <ResMypageStack.Navigator screenOptions={{ headerShown: false }}>
      <ResMypageStack.Screen name="ResMyPageHome" component={ResMyPageScreen} />
      <ResMypageStack.Screen name="ResEditProfileScreen" component={ResEditProfileScreen} />
      <ResMypageStack.Screen name="ResSettingsScreen" component={ResSettingsScreen} />
      <ResMypageStack.Screen name="ResHelp" component={ResHelp} />
    </ResMypageStack.Navigator>
  );
}

const defaultTabBarStyle = {
  backgroundColor: "#FFFFFF",
  borderTopWidth: 1,
  borderTopColor: "#FAFAFC",
  height: 100,
  paddingTop: 8,
  paddingBottom: 10,
};


// 지역주민 탭 네비게이터
const ResidentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
          headerShown: false,
          tabBarStyle: defaultTabBarStyle,
          tabBarActiveTintColor: "#6956E5",
          tabBarInactiveTintColor: "#8C8C8C",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        }}
      >
      {/* HOME 탭: 특정 화면에서 탭바 숨김 */}
              <Tab.Screen
                name="Home"
                component={ResHomeStackScreen}
                options={({ route }) => {
                  const routeName = getFocusedRouteNameFromRoute(route) ?? "ResMainScreen";
                  const shouldHide = 
                  routeName === "ResNotificationScreen" ||
                  routeName === "MyActiveRequestsScreen" ||
                  routeName === "ResMessengerChatScreen" ||
                  routeName === "MyAllRequestsScreen";
                  return {
                    tabBarLabel: "홈",
                    tabBarIcon: ({ color, size }) => (
                      <Image
                        source={require("../assets/images/home.png")}
                        style={{ width: size, height: size, tintColor: color }}
                        resizeMode="contain"
                      />
                    ),
                    tabBarStyle: shouldHide ? { display: "none" } : defaultTabBarStyle,
                  };
                }}
              />


      <Tab.Screen
                name="Jobs"
                component={ResJobsStackScreen}
                options={{
                  tabBarLabel: "의뢰 현황",
                  tabBarIcon: ({ color, size }) => (
                    <Image
                      source={require("../assets/images/user.png")}
                      style={{ width: size, height: size, tintColor: color }}
                      resizeMode="contain"
                    />
                  ),
                }}
              />


      {/* 게시판 탭: 상세 화면 등에서 탭바 숨김 (논리연산자 수정) */}
              <Tab.Screen
                name="Board"
                component={ResBoardStackScreen}
                options={({ route }) => {
                  const routeName = getFocusedRouteNameFromRoute(route) ?? "BoardHome";
                  const shouldHide =
                    routeName === "ChatDetail" ||
                    routeName === "BoardDetail" ||
                    routeName === "MentorDetail" ||
                    routeName === "RegistrationForm" ||
                    routeName === "FreeBoardWriteScreen" ||
                    routeName === "BoardWriteScreen" ||
                    routeName === "MentorBoardWriteScreen";
                  return {
                    tabBarLabel: "게시판",
                    tabBarIcon: ({ color, size }) => (
                      <Image
                        source={require("../assets/images/board.png")}
                        style={{ width: size, height: size, tintColor: color }}
                        resizeMode="contain"
                      />
                    ),
                    tabBarStyle: shouldHide ? { display: "none" } : defaultTabBarStyle,
                  };
                }}
              />


      <Tab.Screen
                name="MessengerTab"
                component={ResMessengerStackScreen}
                options={{
                  tabBarLabel: "메신저",
                  tabBarIcon: ({ color, size }) => (
                    <Image
                      source={require("../assets/images/message.png")}
                      style={{ width: size, height: size, tintColor: color }}
                      resizeMode="contain"
                    />
                  ),
                  // 선택 사항
                  unmountOnBlur: true,
                }}
                listeners={({ navigation }) => ({
                  tabPress: () => {
                    navigation.navigate("MessengerTab", { screen: "MessengerHome" });
                  },
                })}
              />


      <Tab.Screen
                name="ResMyPage"
                component={ResMyPageStackScreen}
                options={({ route }) => {
                  const routeName = getFocusedRouteNameFromRoute(route) ?? "ResMyPageHome";
                  const shouldHide =
                    routeName === "ResEditProfileScreen" ||
                    routeName === "ResSettingsScreen" ||
                    routeName === "ResHelp";
                  return {
                    tabBarLabel: "마이페이지",
                    tabBarIcon: ({ color, size }) => (
                      <Image
                        source={require("../assets/images/setting.png")}
                        style={{ width: size, height: size, tintColor: color }}
                        resizeMode="contain"
                      />
                    ),
                    tabBarStyle: shouldHide ? { display: "none" } : defaultTabBarStyle,
                  };
                }}
              />
    </Tab.Navigator>
  );
};


// 멘토 

const MentorMessengerStack = createNativeStackNavigator();
const MentorBoardStack = createNativeStackNavigator();
const MentorMypageStack = createNativeStackNavigator();
const MentorJobsStack = createNativeStackNavigator();
const MentorHomeStack = createNativeStackNavigator();

function MentorHomeStackScreen() {
  return (
    <MentorHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <MentorHomeStack.Screen name="MentorMainScreen" component={MentorMainScreen} />
      <MentorHomeStack.Screen name="MentorNotificationScreen" component={MentorNotificationScreen} />
      <MentorHomeStack.Screen name="CourseEditorScreen" component={CourseEditorScreen} />
      <MentorHomeStack.Screen name="MyStudentsScreen" component={MyStudentsScreen} />
      <MentorHomeStack.Screen name="CreateClassScreen" component={CreateClassScreen} />
      <MentorHomeStack.Screen name="StudentDetailScreen" component={StudentDetailScreen} />
    </MentorHomeStack.Navigator>
  );
}

function MentorJobsStackScreen() {
  return (
    <MentorJobsStack.Navigator screenOptions={{ headerShown: false }}>
      <MentorJobsStack.Screen name="MentorRequestStatusScreen" component={MentorRequestStatusScreen} />
      <MentorJobsStack.Screen name="MentorMessengerChatScreen" component={MentorMessengerChatScreen} />
    </MentorJobsStack.Navigator>
  );
}

function MentorBoardStackScreen() {
  return (
    <MentorBoardStack.Navigator screenOptions={{ headerShown: false }}>
      <MentorBoardStack.Screen name="BoardHome" component={BoardScreen} />
      <MentorBoardStack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <MentorBoardStack.Screen name="MentorBoard" component={MentorBoardScreen} />
      <MentorBoardStack.Screen name="MentorDetail" component={MentorDetailScreen} />
      <MentorBoardStack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <MentorBoardStack.Screen name="FreeBoard" component={FreeBoardScreen} />
      <MentorBoardStack.Screen name="FreeBoardWriteScreen" component={FreeBoardWriteScreen} />
      <MentorBoardStack.Screen name="MessengerChatScreen" component={MessengerChatScreen} />
      <MentorBoardStack.Screen name="MentorBoardWriteScreen" component={MentorBoardWriteScreen} />
      <MentorBoardStack.Screen name="BoardWriteScreen" component={BoardWriteScreen} />
    </MentorBoardStack.Navigator>
  );
}

function MentorMessengerStackScreen() {
  return (
    <MentorMessengerStack.Navigator screenOptions={{ headerShown: false }}>
      <MentorMessengerStack.Screen name="MessengerHome" component={TabMessengerScreen} />
      <MentorMessengerStack.Screen name="MessengerChatScreen" component={MessengerChatScreen} />
    </MentorMessengerStack.Navigator>
  );
}

function MentorMyPageStackScreen() {
  return (
    <MentorMypageStack.Navigator screenOptions={{ headerShown: false }}>
      <MentorMypageStack.Screen name="MentorMyPageHome" component={MentorMyPageScreen} />
      <MentorMypageStack.Screen name="MentorEditProfileScreen" component={MentorEditProfileScreen} />
      <MentorMypageStack.Screen name="MentorSettingsScreen" component={MentorSettingsScreen} />
      <MentorMypageStack.Screen name="MentorHelp" component={MentorHelp} />
    </MentorMypageStack.Navigator>
  );
}

// 멘토 탭 네비게이터
const MentorTabNavigator = () => {
  return (
    <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: defaultTabBarStyle,
          tabBarActiveTintColor: "#6956E5",
          tabBarInactiveTintColor: "#8C8C8C",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        }}
      >
      {/* HOME 탭: 특정 화면에서 탭바 숨김 */}
        <Tab.Screen
          name="Home"
          component={MentorHomeStackScreen}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "MentorMainScreen";
            const shouldHide = 
            routeName === "MyStudentsScreen" ||
            routeName === "StudentDetailScreen" ||
            routeName === "CreateClassScreen" ||
            routeName === "CourseEditorScreen";
            return { 
              tabBarLabel: "홈",
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={require("../assets/images/home.png")}
                  style={{ width: size, height: size, tintColor: color }}
                  resizeMode="contain"
                />
              ),
              tabBarStyle: shouldHide ? { display: "none" } : defaultTabBarStyle,
            };
          }}
        />
      <Tab.Screen
          name="Jobs"
          component={MentorJobsStackScreen}
          options={{
            tabBarLabel: "의뢰 현황",
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require("../assets/images/user.png")}
                style={{ width: size, height: size, tintColor: color }}
                resizeMode="contain"
              />
            ),
          }}
        />
      {/* 게시판 탭: 상세 화면 등에서 탭바 숨김 (논리연산자 수정) */}
        <Tab.Screen
          name="Board"
          component={MentorBoardStackScreen}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "BoardHome";
            const shouldHide =
              routeName === "ChatDetail" ||
              routeName === "BoardDetail" ||
              routeName === "MentorDetail" ||
              routeName === "RegistrationForm" ||
              routeName === "FreeBoardWriteScreen" ||
              routeName === "BoardWriteScreen" ||
              routeName === "MentorBoardWriteScreen";
            return {
              tabBarLabel: "게시판",
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={require("../assets/images/board.png")}
                  style={{ width: size, height: size, tintColor: color }}
                  resizeMode="contain"
                />
              ),
              tabBarStyle: shouldHide ? { display: "none" } : defaultTabBarStyle,
            };
          }}
        />
      <Tab.Screen
          name="MessengerTab"
          component={MentorMessengerStackScreen}
          options={{
            tabBarLabel: "메신저",
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require("../assets/images/message.png")}
                style={{ width: size, height: size, tintColor: color }}
                resizeMode="contain"
              />
            ),
            // 선택 사항
            unmountOnBlur: true,
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate("MessengerTab", { screen: "MessengerHome" });
            },
          })}
        />
      <Tab.Screen
          name="MentorMyPage"
          component={MentorMyPageStackScreen}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "MentorMyPageHome";
            const shouldHide =
              routeName === "MentorEditProfileScreen" ||
              routeName === "MentorSettingsScreen" ||
              routeName === "MentorHelp";
            return {
              tabBarLabel: "마이페이지",
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={require("../assets/images/setting.png")}
                  style={{ width: size, height: size, tintColor: color }}
                  resizeMode="contain"
                />
              ),
              tabBarStyle: shouldHide ? { display: "none" } : defaultTabBarStyle,
            };
          }}
        />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ReturneeSignUp" component={ReturneeSignUpScreen} />
        <Stack.Screen name="ResidentSignUp" component={ResidentSignUpScreen} />
        <Stack.Screen name="MentorSignUp" component={MentorSignUpScreen} />
        
        {/* Main App Screens */}
        <Stack.Screen name="ReturneeMain" component={ReturneeTabNavigator} />
        <Stack.Screen name="ResidentMain" component={ResidentTabNavigator} />
        <Stack.Screen name="MentorMain" component={MentorTabNavigator} />
        
        {/* Mission Screens */}
        <Stack.Screen name="MissionLoading" component={MissionLoadingScreen} />
        <Stack.Screen name="MissionList" component={MissionListScreen} />
        <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
        <Stack.Screen name="MissionCardGame" component={MissionCardGameScreen} />
        <Stack.Screen name="MissionDashboard" component={MissionDashboardScreen} />
        
        {/* MyPage Screens */}
        <Stack.Screen name="ResidentMyPage" component={ResidentMyPageScreen} />
        
        {/* Additional Screens */}
        <Stack.Screen 
          name="Chatbot" 
          component={ChatbotScreen}
        />
        <Stack.Screen 
          name="Achievement" 
          component={AchievementScreen}
        />
        <Stack.Screen 
          name="GoalSetting" 
          component={GoalSettingScreen}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
        />
        <Stack.Screen 
          name="Help" 
          component={HelpScreen}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen}
        />
                <Stack.Screen
          name="PrivacySettings"
          component={PrivacySettingsScreen}
        />
        <Stack.Screen
          name="Board"
          component={BoardScreen}
        />
        <Stack.Screen
          name="BoardDetail"
          component={BoardDetailScreen}
        />
        <Stack.Screen
          name="BoardWrite"
          component={BoardWriteScreen}
        />
        <Stack.Screen
          name="RequestBoard"
          component={RequestBoardScreen}
        />
        <Stack.Screen
          name="MentorBoard"
          component={MentorBoardScreen}
        />
        <Stack.Screen
          name="FreeBoard"
          component={FreeBoardScreen}
        />
        <Stack.Screen
          name="Messenger"
          component={MessengerScreen}
        />
        <Stack.Screen
          name="MentorDetail"
          component={MentorDetailScreen}
        />
        <Stack.Screen
          name="FreeBoardWrite"
          component={FreeBoardWriteScreen}
        />
        <Stack.Screen
          name="MentorSeekingWrite"
          component={MentorSeekingWriteScreen}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
        />
        <Stack.Screen
          name="EducationMentor"
          component={ReturneeMainScreen} // 임시로 같은 화면 사용
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
