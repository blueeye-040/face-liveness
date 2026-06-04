import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';

export async function loadModel(): Promise<TfliteModel> {
    const model = await loadTensorflowModel(
        require('../models/mobilefacenet.tflite'),
        [], // empty = CPU delegate (default)
    );

    return model;
}
