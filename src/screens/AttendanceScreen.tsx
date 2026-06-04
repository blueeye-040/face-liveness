import React from 'react';
import { View } from 'react-native';
import CameraView from '../components/CameraView';

export default function AttendanceScreen() {
  return (
    <View style={{ flex: 1 }}>
      <CameraView />
    </View>
  );
}