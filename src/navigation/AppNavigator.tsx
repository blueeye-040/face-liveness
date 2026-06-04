import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import EnrollmentScreen from '../screens/EnrollmentScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
    Dashboard: undefined;
    Home: undefined;
    Enrollment: undefined;
    Attendance: undefined;
    History: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerStyle: { backgroundColor: '#111' },
                headerTintColor: '#00FF00',
                headerTitleStyle: { fontWeight: 'bold' },
                contentStyle: { backgroundColor: '#000' },
            }}
        >
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'FaceAuth' }} />
            <Stack.Screen name="Enrollment" component={EnrollmentScreen} options={{ title: 'Enroll Employee' }} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Mark Attendance', headerShown: false }} />
            <Stack.Screen name="History" component={AttendanceHistoryScreen} options={{ title: 'Attendance History' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
    );
}
