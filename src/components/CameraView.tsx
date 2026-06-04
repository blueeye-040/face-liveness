import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useFaceDetectorOutput } from 'react-native-vision-camera-face-detector';
import type { Face } from 'react-native-vision-camera-face-detector';
import FaceBoundingBox from './FaceBoundingBox';
import type { FaceBounds } from '../types/Detection';
import LivenessProgress from './LivenessProgress';

import {
  LivenessEngine,
  HeadDirection,
} from '../ai/LivenessEngine';

export default function CameraView() {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const device = useCameraDevice('front');
    const { hasPermission, requestPermission } = useCameraPermission();
    const [faces, setFaces] = useState<FaceBounds[]>([]);
    const [instruction, setInstruction] = useState('Turn Head Left');

    const [leftCompleted, setLeftCompleted] = useState(false);

    const [rightCompleted, setRightCompleted] = useState(false);

    const [livenessPassed, setLivenessPassed] = useState(false);

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission, requestPermission]);

    const onFacesDetected = useCallback((detectedFaces: Face[]) => {
        
        setFaces(
            detectedFaces.map(face => ({
                x: face.bounds.x,
                y: face.bounds.y,
                width: face.bounds.width,
                height: face.bounds.height,
            }))
        );

        if (detectedFaces.length === 0 || livenessPassed) { return; }
        const face = detectedFaces[0];
        const direction = LivenessEngine.getHeadDirection(face.yawAngle,);

        if (!leftCompleted && direction === HeadDirection.LEFT) {
            setLeftCompleted(true);
            setInstruction('Turn Head Right');
        }
        if (leftCompleted && !rightCompleted && direction === HeadDirection.RIGHT) {
            setRightCompleted(true);
            setInstruction('Liveness Passed');
            setLivenessPassed(true);
        }

    }, [leftCompleted, rightCompleted, livenessPassed]);
    

    const onError = useCallback((error: Error) => {
        console.error('Face detection error:', error);
    }, []);

    const cameraOutput = useFaceDetectorOutput({
        onFacesDetected,
        onError,
        performanceMode: 'fast',
        autoMode: true,
        windowWidth,
        windowHeight,
        runLandmarks: true,
        runContours: true,
    });

    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No camera device found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                outputs={[cameraOutput]}
            />
            <LivenessProgress instruction={instruction} />
            {faces.map((face, index) => (
                <FaceBoundingBox key={index} {...face} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        margin: 20,
    },
});
