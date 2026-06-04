import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Animated, StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useFaceDetectorOutput } from 'react-native-vision-camera-face-detector';
import type { Face } from 'react-native-vision-camera-face-detector';
import FaceBoundingBox from './FaceBoundingBox';
import LivenessProgress from './LivenessProgress';
import { LivenessEngine } from '../ai/LivenessEngine';

export default function CameraView() {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const device = useCameraDevice('front');
    const { hasPermission, requestPermission } = useCameraPermission();

    const [instruction, setInstruction]  = useState('Look Straight at Camera');
    const prevInstruction = useRef('Look Straight at Camera');

    // Only transform + opacity use Animated.Value — these are native-driver safe in new arch.
    // width/height stay as plain numbers; face size is stable so re-renders are rare.
    const boxPos     = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const boxOpacity = useRef(new Animated.Value(0)).current;
    const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });
    const prevSize   = useRef({ width: 0, height: 0 });

    const liveness = useRef(LivenessEngine.initialState());

    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission, requestPermission]);

    const onFacesDetected = useCallback((detectedFaces: Face[]) => {
        if (detectedFaces.length === 0) {
            boxOpacity.setValue(0);
            return;
        }

        const face = detectedFaces[0];
        const b = face.bounds;

        // Position update every frame — bypasses React, goes straight to native
        boxPos.setValue({ x: b.x, y: b.y });
        boxOpacity.setValue(1);

        // Size update only when face moves significantly closer/farther (rare)
        if (
            Math.abs(b.width  - prevSize.current.width)  > 15 ||
            Math.abs(b.height - prevSize.current.height) > 15
        ) {
            prevSize.current = { width: b.width, height: b.height };
            setBoxSize({ width: b.width, height: b.height });
        }

        const result = LivenessEngine.processFace({
            yawAngle:                face.yawAngle,
            pitchAngle:              face.pitchAngle,
            leftEyeOpenProbability:  face.leftEyeOpenProbability,
            rightEyeOpenProbability: face.rightEyeOpenProbability,
            smilingProbability:      face.smilingProbability,
        }, liveness.current);

        liveness.current = result.state;

        if (result.instruction !== prevInstruction.current) {
            prevInstruction.current = result.instruction;
            setInstruction(result.instruction);
        }
    }, []);

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
        runClassifications: true,
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
            <FaceBoundingBox
                pos={boxPos}
                opacity={boxOpacity}
                width={boxSize.width}
                height={boxSize.height}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    text: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        margin: 20,
    },
});
