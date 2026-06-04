import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { UserRepository } from '../database/UserRepository';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props { navigation: Nav; }

export default function HomeScreen({ navigation }: Props) {
    const employeeCount = UserRepository.count();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>FaceAuth</Text>
            <Text style={styles.subtitle}>{employeeCount} employee{employeeCount !== 1 ? 's' : ''} enrolled</Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Attendance')}>
                <Text style={styles.primaryBtnText}>Mark Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Enrollment')}>
                <Text style={styles.secondaryBtnText}>Enroll Employee</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('History')}>
                <Text style={styles.secondaryBtnText}>View History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Settings')}>
                <Text style={styles.secondaryBtnText}>Settings</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#000' },
    title:    { fontSize: 36, fontWeight: 'bold', color: '#00FF00', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 48 },
    primaryBtn: {
        width: '100%', backgroundColor: '#00FF00', padding: 18,
        borderRadius: 12, alignItems: 'center', marginBottom: 16,
    },
    primaryBtnText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    secondaryBtn: {
        width: '100%', backgroundColor: '#1a1a1a', padding: 18,
        borderRadius: 12, alignItems: 'center', marginBottom: 12,
        borderWidth: 1, borderColor: '#333',
    },
    secondaryBtnText: { fontSize: 16, color: '#fff' },
});
