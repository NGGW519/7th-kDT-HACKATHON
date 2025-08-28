// App.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, Text, View } from "react-native";

import MentorMainScreen from "./src/screens/MentorMainScreen";

import RequestStatusScreen from "./src/screens/RequestStatusScreen";

import BoardDetailScreen from "./src/screens/BoardDetailScreen";
import BoardScreen from "./src/screens/BoardScreen";
import ChatDetailScreen from "./src/screens/ChatDetailScreen";

import MentorBoardScreen from "./src/screens/MentorBoardScreen";
import MentorDetailScreen from "./src/screens/MentorDetailScreen";

import MessengerChatScreen from "./src/screens/MessengerChatScreen";
import MessengerScreen from "./src/screens/MessengerScreen";
import RegistrationFormScreen from "./src/screens/RegistrationFormScreen";

import EditProfileScreen from "./src/screens/EditProfileScreen";
import MyPageScreen from "./src/screens/MyPageScreen";

export type BoardStackParamList = {
  BoardHome: undefined;
  BoardDetail: undefined;
  RegistrationForm: undefined;
  MentorBoard: undefined;
  MentorDetail: undefined;
  ChatDetail: { chat: { name: string; subtitle: string } };
};

const Tab = createBottomTabNavigator();
const MessengerStack = createNativeStackNavigator();
const BoardStack = createNativeStackNavigator<BoardStackParamList>();
const MypageStack = createNativeStackNavigator();
const JobsStack = createNativeStackNavigator();

function JobsStackScreen() {
  return (
    <JobsStack.Navigator screenOptions={{ headerShown: false }}>
      <JobsStack.Screen name="RequestCreate" component={RequestStatusScreen} />
      <JobsStack.Screen name="MessengerChatScreen" component={MessengerChatScreen} />
    </JobsStack.Navigator>
  );
}

function BoardStackScreen() {
  return (
    <BoardStack.Navigator screenOptions={{ headerShown: false }}>
      <BoardStack.Screen name="BoardHome" component={BoardScreen} />
      <BoardStack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <BoardStack.Screen name="RegistrationForm" component={RegistrationFormScreen} />
      <BoardStack.Screen name="MentorBoard" component={MentorBoardScreen} />
      <BoardStack.Screen name="MentorDetail" component={MentorDetailScreen}/>
      <BoardStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </BoardStack.Navigator>
  );
}

function MessengerStackScreen() {
  return (
    <MessengerStack.Navigator screenOptions={{ headerShown: false }}>
      <MessengerStack.Screen name="MessengerHome" component={MessengerScreen} />
      <MessengerStack.Screen name="MessengerChatScreen" component={MessengerChatScreen} />
    </MessengerStack.Navigator>
  );
}

function MyPageStackScreen() {
  return (
    <MypageStack.Navigator screenOptions={{ headerShown: false }}>
      <MypageStack.Screen name="MyPageHome" component={MyPageScreen} />
      <MypageStack.Screen name="EditProfileScreen" component={EditProfileScreen} />
    </MypageStack.Navigator>
  );
}

function Placeholder({ label }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{label}</Text>
    </View>
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

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: defaultTabBarStyle,
          tabBarActiveTintColor: "#6956E5",
          tabBarInactiveTintColor: "#8C8C8C",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        }}
      >
        <Tab.Screen
          name="Home"
          component={MentorMainScreen}
          options={{
            tabBarLabel: "홈",
            tabBarIcon: ({ color, size }) => (
              <Image source={require("./src/images/home.png")} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />
            ),
          }}
        />

        <Tab.Screen
          name="Jobs"
          component={JobsStackScreen}
          options={{
            tabBarLabel: "의뢰 현황",
            tabBarIcon: ({ color, size }) => (
              <Image source={require("./src/images/user.png")} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />
            ),
          }}
        />

        {/* 게시판 탭 */}
        <Tab.Screen
          name="Board"
          component={BoardStackScreen}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "BoardHome";
            return {
              tabBarLabel: "게시판",
              tabBarIcon: ({ color, size }) => (
                <Image source={require("./src/images/board.png")} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />
              ),
              // BoardDetail일 때 탭바 숨기기
              tabBarStyle: (routeName === "BoardDetail"|| routeName === "MentorDetail" || routeName === "RegistrationForm") ? { display: "none" } : defaultTabBarStyle,
            };
          }}
        />

          <Tab.Screen
            name="MessengerTab"
            component={MessengerStackScreen}
            options={{
              tabBarLabel: "메신저",
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={require("./src/images/message.png")}
                  style={{ width: size, height: size, tintColor: color }}
                  resizeMode="contain"
                />
              ),
              // 선택: 탭을 떠날 때 스택 상태를 버리고 재진입 시 항상 초기화하고 싶다면 켜기
              unmountOnBlur: true,
            }}
            listeners={({ navigation }) => ({
              tabPress: () => {
                // 탭을 누를 때마다 스택의 최상단을 홈으로 맞춤
                navigation.navigate("MessengerTab", { screen: "MessengerHome" });
              },
            })}
          />

        

        <Tab.Screen
          name="MyPage"
          component={MyPageStackScreen}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "MyPageHome";
            return {
            tabBarLabel: "마이페이지",
            tabBarIcon: ({ color, size }) => (
              <Image source={require("./src/images/setting.png")} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />
            ),  tabBarStyle: (routeName === "EditProfileScreen") ? { display: "none" } : defaultTabBarStyle,
          }}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
