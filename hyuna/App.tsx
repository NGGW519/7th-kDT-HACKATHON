// App.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, Text, View } from "react-native";

import BoardDetailScreen from "./src/screens/BoardDetailScreen";
import BoardScreen from "./src/screens/BoardScreen";
import ChatDetailScreen from "./src/screens/ChatDetailScreen";

import MentorBoardScreen from "./src/screens/MentorBoardScreen";
import MentorDetailScreen from "./src/screens/MentorDetailScreen";

import MessengerScreen from "./src/screens/MessengerScreen";
import RegistrationFormScreen from "./src/screens/RegistrationFormScreen";


const Tab = createBottomTabNavigator();
const MessengerStack = createNativeStackNavigator();
const BoardStack = createNativeStackNavigator();

function BoardStackScreen() {
  return (
    <BoardStack.Navigator screenOptions={{ headerShown: false }}>
      <BoardStack.Screen name="BoardHome" component={BoardScreen} />
      <BoardStack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <BoardStack.Screen name="RegistrationForm" component={RegistrationFormScreen} />
      <BoardStack.Screen name="MentorBoard" component={MentorBoardScreen} />
      <BoardStack.Screen name="MentorDetail" component={MentorDetailScreen}/>
      <BoardStack.Screen name="ChatDetail" component={ChatDetailScreen}/>
    </BoardStack.Navigator>
  );
}

function MessengerStackScreen() {
  return (
    <MessengerStack.Navigator screenOptions={{ headerShown: false }}>
      <MessengerStack.Screen name="MessengerHome" component={MessengerScreen} />
    </MessengerStack.Navigator>
  );
}

const ChatDetailStack = createNativeStackNavigator();

function ChatDetailStackScreen() {
  return (
    <ChatDetailStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatDetailStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ChatDetailStack.Navigator>
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
          component={() => <Placeholder label="홈" />}
          options={{
            tabBarLabel: "홈",
            tabBarIcon: ({ color, size }) => (
              <Image source={require("./src/images/home.png")} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />
            ),
          }}
        />

        <Tab.Screen
          name="Jobs"
          component={() => <Placeholder label="의뢰 현황" />}
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
              tabBarStyle: (routeName === "BoardDetail" || routeName === "RegistrationForm" || routeName === "MentorDetail") ? { display: "none" } : defaultTabBarStyle,
            };
          }}
        />

        <Tab.Screen
          name="MessengerTab"
          component={MessengerStackScreen}
          options={{
            tabBarLabel: "메신저",
            tabBarIcon: ({ color, size }) => (
              <Image source={require("./src/images/message.png")} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />
            ),
          }}
        />

        <Tab.Screen
          name="ChatDetailTab"
          component={ChatDetailStackScreen}
          options={{
            tabBarItemStyle: { display: 'none' }, // Hide the tab item
            headerShown: false,
          }}
        />

        <Tab.Screen
          name="MyPage"
          component={() => <Placeholder label="마이페이지" />}
          options={{
            tabBarLabel: "마이페이지",
            tabBarIcon: ({ color, size }) => (
              <Image source={require("./src/images/setting.png")} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
