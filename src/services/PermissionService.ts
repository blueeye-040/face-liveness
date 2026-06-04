import { PermissionsAndroid, Platform } from 'react-native';

export class PermissionService {
    static async requestAll(): Promise<void> {
        if (Platform.OS !== 'android') return;

        await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
    }
}
