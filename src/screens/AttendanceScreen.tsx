import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CameraView from '../components/CameraView';
import { AttendanceService, MatchResult } from '../services/AttendanceService';

export default function AttendanceScreen() {
    const [result, setResult] = useState<MatchResult | null>(null);

    const handleComplete = (_imagePath: string, embedding: number[]) => {
        const match = AttendanceService.findBestMatch(embedding);
        AttendanceService.recordAttendance(match);
        setResult(match);
        // clear after 3s to match CameraView's own reset timer
        setTimeout(() => setResult(null), 3000);
    };

    return (
        <View style={{ flex: 1 }}>
            <CameraView onComplete={handleComplete} />

            {result && (
                <View style={[styles.overlay, result.matched ? styles.matchedBg : styles.failedBg]}>
                    {result.matched ? (
                        <>
                            <Text style={styles.welcomeText}>Welcome!</Text>
                            <Text style={styles.nameText}>{result.employee!.name}</Text>
                            <Text style={styles.confidenceText}>
                                {(result.confidence * 100).toFixed(1)}% match
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.failText}>Not Recognized</Text>
                            <Text style={styles.confidenceText}>
                                Best score: {(result.confidence * 100).toFixed(1)}%
                            </Text>
                        </>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    matchedBg: { backgroundColor: 'rgba(0,0,0,0.85)' },
    failedBg:  { backgroundColor: 'rgba(0,0,0,0.85)' },
    welcomeText:    { fontSize: 24, color: '#888', marginBottom: 8 },
    nameText:       { fontSize: 42, fontWeight: 'bold', color: '#00FF00', marginBottom: 12 },
    confidenceText: { fontSize: 16, color: '#888' },
    failText:       { fontSize: 32, fontWeight: 'bold', color: '#FF4444' },
});
