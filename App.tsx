import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { PermissionService } from './src/services/PermissionService';

export default function App() {
    useEffect(() => {
        Geolocation.setRNConfiguration({ skipPermissionRequests: true, authorizationLevel: 'whenInUse' });
        PermissionService.requestAll();
    }, []);

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <AppNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
