import type { TfliteModel, } from 'react-native-fast-tflite';

import { loadModel, } from './ModelLoader';

import { ImageProcessingService, } from '../services/ImageProcessingService';

export class FaceRecognitionEngine {

    private static model: TfliteModel | null = null;

    static async initialize() {

        if (!this.model) {
            this.model =
                await loadModel();

            console.log(
                '[MODEL_READY]',
            );
        }
    }

    static async generateEmbedding(
        imagePath: string,
    ): Promise<number[]> {

        if (!this.model) {
            await this.initialize();
        }

        const tensor =
            await ImageProcessingService
                .imageToTensor(
                    imagePath,
                );

        // runSync expects ArrayBuffer[]; Float32Array.buffer gives the underlying ArrayBuffer
        const output = this.model!.runSync([tensor.buffer as ArrayBuffer]);

        // output[0] is ArrayBuffer — wrap in Float32Array to read floats
        const embedding = Array.from(new Float32Array(output[0]));

        console.log(
            '[EMBEDDING_LENGTH]',
            embedding.length,
        );

        return embedding;
    }
}