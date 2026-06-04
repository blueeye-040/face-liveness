import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { UserRepository } from '../database/UserRepository';
import { AttendanceRepository } from '../database/AttendanceRepository';

export default function SettingsScreen() {
    const clearEnrollments = () => {
        Alert.alert('Clear Enrollments', 'Delete all enrolled employees?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {
                UserRepository.deleteAll();
                Alert.alert('Done', 'All enrollments cleared.');
            }},
        ]);
    };

    const clearAttendance = () => {
        Alert.alert('Clear Attendance', 'Delete all attendance records?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {
                AttendanceRepository.deleteAll();
                Alert.alert('Done', 'All attendance records cleared.');
            }},
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.section}>Database</Text>
            <TouchableOpacity style={styles.dangerBtn} onPress={clearEnrollments}>
                <Text style={styles.dangerBtnText}>Clear All Enrollments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerBtn} onPress={clearAttendance}>
                <Text style={styles.dangerBtnText}>Clear Attendance History</Text>
            </TouchableOpacity>

            <Text style={styles.section}>Info</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Model</Text>
                <Text style={styles.infoValue}>MobileFaceNet</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Threshold</Text>
                <Text style={styles.infoValue}>60% cosine similarity</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Liveness</Text>
                <Text style={styles.infoValue}>5-step (straight→blink×2→left→right→smile)</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#000' },
    section:   { fontSize: 12, color: '#555', marginTop: 28, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    dangerBtn: {
        backgroundColor: '#1a1a1a', padding: 16, borderRadius: 10,
        borderWidth: 1, borderColor: '#FF4444', marginBottom: 12,
    },
    dangerBtnText: { color: '#FF4444', fontSize: 15, fontWeight: '600' },
    infoRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
    infoLabel: { color: '#555', fontSize: 14 },
    infoValue: { color: '#fff', fontSize: 14, flex: 1, textAlign: 'right' },
});
