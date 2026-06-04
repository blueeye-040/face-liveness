import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { AttendanceRepository } from '../database/AttendanceRepository';
import type { AttendanceRecord } from '../types/Attendance';

export default function AttendanceHistoryScreen() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        setRecords(AttendanceRepository.getAll());
    }, []);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (records.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>No attendance records yet.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={records}
            keyExtractor={item => item.id}
            style={styles.list}
            renderItem={({ item }) => (
                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                        <Text style={styles.name}>{item.employeeName}</Text>
                        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
                    </View>
                    <View style={styles.rowRight}>
                        <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                        <Text style={styles.confidence}>{(item.confidence * 100).toFixed(0)}%</Text>
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list:       { flex: 1, backgroundColor: '#000' },
    empty:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    emptyText:  { color: '#555', fontSize: 16 },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    },
    rowLeft:    { flex: 1 },
    rowRight:   { alignItems: 'flex-end' },
    name:       { fontSize: 16, color: '#fff', fontWeight: '600' },
    date:       { fontSize: 12, color: '#555', marginTop: 2 },
    time:       { fontSize: 15, color: '#00FF00', fontWeight: '600' },
    confidence: { fontSize: 11, color: '#555', marginTop: 2 },
});
