import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Animated, StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { useFaceDetectorOutput } from 'react-native-vision-camera-face-detector';
import type { Face } from 'react-native-vision-camera-face-detector';
import FaceBoundingBox from './FaceBoundingBox';
import LivenessProgress from './LivenessProgress';
import { LivenessEngine } from '../ai/LivenessEngine';
import { FaceRecognitionEngine } from '../ai/FaceRecognitionEngine';

interface Props {
    onComplete?: (imagePath: string, embedding: number[]) => void;
}

export default function CameraView({ onComplete }: Props = {}) {
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const device = useCameraDevice('front');
    const { hasPermission, requestPermission } = useCameraPermission();
    const photoOutput = usePhotoOutput();
    const recognitionTriggered = useRef(false);

    const [instruction, setInstruction]  = useState('Look Straight at Camera');
    const prevInstruction = useRef('Look Straight at Camera');
    const [capturedPath, setCapturedPath] = useState<string | null>(null);

    // Only transform + opacity use Animated.Value — these are native-driver safe in new arch.
    // width/height stay as plain numbers; face size is stable so re-renders are rare.
    const boxPos     = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const boxOpacity = useRef(new Animated.Value(0)).current;
    const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });
    const prevSize   = useRef({ width: 0, height: 0 });
    const lastFaceRef = useRef<Face | null>(null);
    const liveness = useRef(LivenessEngine.initialState());

    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission, requestPermission]);

    // Reset everything after 3 seconds so the next person can use the camera
    useEffect(() => {
        if (!capturedPath) return;
        const timer = setTimeout(() => {
            setCapturedPath(null);
            recognitionTriggered.current = false;
            liveness.current = LivenessEngine.initialState();
            prevInstruction.current = 'Look Straight at Camera';
            setInstruction('Look Straight at Camera');
            boxOpacity.setValue(0);
        }, 3000);
        return () => clearTimeout(timer);
    }, [capturedPath]);

    const captureFace = useCallback(async () => {
        try {
            const photo = await photoOutput.capturePhotoToFile({ flashMode: 'off' }, {});
            console.log('[FACE_CAPTURED]', photo.filePath);
            setCapturedPath(photo.filePath);

            const embedding = await FaceRecognitionEngine.generateEmbedding(photo.filePath);
            console.log('[EMBEDDING_LENGTH]', embedding.length);
            onCompleteRef.current?.(photo.filePath, embedding);
        } catch (error) {
            console.error('[CAPTURE_ERROR]', error);
        }
    }, [photoOutput]);

    const onFacesDetected = useCallback((detectedFaces: Face[]) => {
        if (detectedFaces.length === 0) {
            boxOpacity.setValue(0);
            return;
        }

        const face = detectedFaces[0];
        lastFaceRef.current = face;
        const b = face.bounds;

        // Once capture is triggered, freeze all state updates to keep camera stable
        if (recognitionTriggered.current) {
            boxPos.setValue({ x: b.x, y: b.y });
            boxOpacity.setValue(1);
            return;
        }

        boxPos.setValue({ x: b.x, y: b.y });
        boxOpacity.setValue(1);

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

        if (result.state.passed && !recognitionTriggered.current) {
            recognitionTriggered.current = true;
            captureFace();
            return;
        }

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

    if (capturedPath) {
        return (
            <View style={styles.success}>
                <Text style={styles.successTitle}>Liveness Passed ✓</Text>
                <Text style={styles.successPath}>{capturedPath}</Text>
            </View>
        );
    }

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
                outputs={[cameraOutput, photoOutput]}
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
    text: { fontSize: 18, color: '#333', textAlign: 'center', margin: 20 },
    success: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    successTitle: { fontSize: 28, fontWeight: 'bold', color: '#00FF00', marginBottom: 20 },
    successPath: { fontSize: 11, color: '#aaa', textAlign: 'center', paddingHorizontal: 20 },
});
