import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { PermissionService } from './src/services/PermissionService';
import { SyncService } from './src/services/SyncService';

export default function App() {
    useEffect(() => {
        Geolocation.setRNConfiguration({ skipPermissionRequests: true, authorizationLevel: 'whenInUse' });
        PermissionService.requestAll();

        // Sync on launch if already online
        NetInfo.fetch().then((state) => {
            if (state.isConnected && state.isInternetReachable) {
                SyncService.syncWithRetry();
            }
        });

        // Sync whenever internet reconnects
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isConnected && state.isInternetReachable) {
                SyncService.syncWithRetry();
            }
        });
        return () => unsubscribe();
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
