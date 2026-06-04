import RNFS from 'react-native-fs';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import ImageResizer from '@bam.tech/react-native-image-resizer';

export class ImageProcessingService {

    static async imageToTensor(
        imagePath: string,
    ): Promise<Float32Array> {

        const resized =
            await ImageResizer.createResizedImage(
                imagePath,
                112,
                112,
                'JPEG',
                100,
            );

        const base64 =
            await RNFS.readFile(
                resized.path,
                'base64',
            );

        const buffer =
            Buffer.from(
                base64,
                'base64',
            );

        const decoded =
            jpeg.decode(
                buffer,
                {
                    useTArray: true,
                },
            );

        const tensor =
            new Float32Array(
                112 * 112 * 3,
            );

        let tensorIndex = 0;

        for (
            let i = 0;
            i < decoded.data.length;
            i += 4
        ) {
            const r =
                decoded.data[i];

            const g =
                decoded.data[i + 1];

            const b =
                decoded.data[i + 2];

            tensor[tensorIndex++] =
                (r - 127.5) / 127.5;

            tensor[tensorIndex++] =
                (g - 127.5) / 127.5;

            tensor[tensorIndex++] =
                (b - 127.5) / 127.5;
        }

        return tensor;
    }
}