import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { UserRepository } from '../database/UserRepository';
import { AttendanceRepository } from '../database/AttendanceRepository';
import { SyncService } from '../services/SyncService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
interface Props { navigation: Nav; }

function formatSyncTime(iso: string | null): string {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
    });
}

export default function DashboardScreen({ navigation }: Props) {
    const [stats, setStats] = useState({
        employees: 0,
        today: 0,
        pending: 0,
        lastSync: null as string | null,
    });

    useFocusEffect(
        useCallback(() => {
            const refresh = () => {
                try {
                    const records = AttendanceRepository.getAll();
                    const todayStr = new Date().toDateString();
                    const todayCount = records.filter(
                        r => new Date(r.timestamp).toDateString() === todayStr
                    ).length;
                    SyncService.getLastSyncTime().then((lastSync) => {
                        setStats({
                            employees: UserRepository.count(),
                            today: todayCount,
                            pending: AttendanceRepository.getPending().length,
                            lastSync,
                        });
                    }).catch(() => {});
                } catch (e) {
                    console.error('[DASHBOARD] refresh error', e);
                }
            };

            refresh();
            const interval = setInterval(refresh, 2000);
            return () => clearInterval(interval);
        }, [])
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.appName}>FaceAuth</Text>
            <Text style={styles.tagline}>Offline Attendance System</Text>

            <View style={styles.grid}>
                <View style={[styles.card, styles.cardGreen]}>
                    <Text style={styles.cardValue}>{stats.employees}</Text>
                    <Text style={styles.cardLabel}>Employees{'\n'}Registered</Text>
                </View>
                <View style={[styles.card, styles.cardBlue]}>
                    <Text style={styles.cardValue}>{stats.today}</Text>
                    <Text style={styles.cardLabel}>Attendance{'\n'}Today</Text>
                </View>
                <View style={[styles.card, styles.cardOrange]}>
                    <Text style={styles.cardValue}>{stats.pending}</Text>
                    <Text style={styles.cardLabel}>Pending{'\n'}Sync</Text>
                </View>
                <View style={[styles.card, styles.cardPurple]}>
                    <Text style={styles.cardValue}>{formatSyncTime(stats.lastSync)}</Text>
                    <Text style={styles.cardLabel}>Last{'\n'}Sync</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Attendance')}
            >
                <Text style={styles.primaryBtnText}>Mark Attendance</Text>
            </TouchableOpacity>

            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.halfBtn}
                    onPress={() => navigation.navigate('Enrollment')}
                >
                    <Text style={styles.halfBtnIcon}>+</Text>
                    <Text style={styles.halfBtnText}>Enroll</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.halfBtn}
                    onPress={() => navigation.navigate('History')}
                >
                    <Text style={styles.halfBtnIcon}>☰</Text>
                    <Text style={styles.halfBtnText}>History</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.settingsBtn}
                onPress={() => navigation.navigate('Settings')}
            >
                <Text style={styles.settingsBtnText}>Settings</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#000',
        alignItems: 'center',
    },
    appName: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#00FF00',
        marginTop: 16,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 13,
        color: '#444',
        marginBottom: 36,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        width: '100%',
        marginBottom: 32,
    },
    card: {
        width: '47%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'flex-start',
        borderWidth: 1,
    },
    cardGreen:  { backgroundColor: '#001a00', borderColor: '#00FF00' },
    cardBlue:   { backgroundColor: '#001020', borderColor: '#0088FF' },
    cardOrange: { backgroundColor: '#1a0a00', borderColor: '#FF8800' },
    cardPurple: { backgroundColor: '#100018', borderColor: '#AA44FF' },
    cardValue: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
    },
    cardLabel: {
        fontSize: 12,
        color: '#888',
        lineHeight: 18,
    },
    primaryBtn: {
        width: '100%',
        backgroundColor: '#00FF00',
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 14,
    },
    primaryBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginBottom: 14,
    },
    halfBtn: {
        flex: 1,
        backgroundColor: '#111',
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    halfBtnIcon: {
        fontSize: 20,
        color: '#00FF00',
        marginBottom: 4,
    },
    halfBtnText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    settingsBtn: {
        width: '100%',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },
    settingsBtnText: {
        fontSize: 15,
        color: '#555',
    },
});
