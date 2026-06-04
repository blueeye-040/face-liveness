import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import CameraView from '../components/CameraView';
import { EnrollmentService } from '../services/EnrollmentService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Enrollment'>;
interface Props { navigation: Nav; }

export default function EnrollmentScreen({ navigation }: Props) {
    const [name, setName] = useState('');
    const [capturing, setCapturing] = useState(false);

    const startCapture = () => {
        if (!name.trim()) {
            Alert.alert('Name Required', 'Please enter the employee name first.');
            return;
        }
        setCapturing(true);
    };

    const handleComplete = (imagePath: string, embedding: number[]) => {
        try {
            const employee = EnrollmentService.enroll(name.trim(), embedding);
            console.log('[ENROLLED]', employee.id, employee.name);
            Alert.alert('Enrolled!', `${employee.name} has been enrolled successfully.`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e) {
            Alert.alert('Error', 'Failed to save enrollment. Please try again.');
            setCapturing(false);
        }
    };

    if (capturing) {
        return <CameraView onComplete={handleComplete} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Employee Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#555"
                autoFocus
            />
            <TouchableOpacity style={styles.btn} onPress={startCapture}>
                <Text style={styles.btnText}>Start Enrollment</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>Look straight → blink twice → turn head → smile</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#000' },
    label:   { fontSize: 14, color: '#888', marginBottom: 8 },
    input: {
        backgroundColor: '#1a1a1a', color: '#fff', fontSize: 18,
        padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333',
        marginBottom: 24,
    },
    btn: { backgroundColor: '#00FF00', padding: 18, borderRadius: 12, alignItems: 'center' },
    btnText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    hint: { marginTop: 24, color: '#555', textAlign: 'center', fontSize: 13 },
});
