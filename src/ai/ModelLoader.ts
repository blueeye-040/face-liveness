import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';

const MODEL_FILENAME = 'mobilefacenet.tflite';

// Copies model from app bundle to documents on first launch,
// then loads from that file path — works in both debug and release.
async function getModelFilePath(): Promise<string> {
    const destPath = `${RNFS.DocumentDirectoryPath}/${MODEL_FILENAME}`;

    if (!(await RNFS.exists(destPath))) {
        if (Platform.OS === 'android') {
            // Model is in android/app/src/main/assets/mobilefacenet.tflite
            await RNFS.copyFileAssets(MODEL_FILENAME, destPath);
        } else {
            // Model must be added to Xcode project bundle
            await RNFS.copyFile(`${RNFS.MainBundlePath}/${MODEL_FILENAME}`, destPath);
        }
        console.log('[MODEL] Copied to', destPath);
    }

    return destPath;
}

export async function loadModel(): Promise<TfliteModel> {
    const modelPath = await getModelFilePath();
    const model = await loadTensorflowModel({ url: `file://${modelPath}` }, []);
    return model;
}
