export interface FaceData {
    yawAngle: number;
    pitchAngle: number;
    leftEyeOpenProbability?:  number;
    rightEyeOpenProbability?: number;
    smilingProbability?:      number;
}

export enum LivenessStep {
    LOOK_STRAIGHT = 0,
    BLINK         = 1,
    HEAD_LEFT     = 2,
    HEAD_RIGHT    = 3,
    SMILE         = 4,
    PASSED        = 5,
}

export interface LivenessState {
    step:           LivenessStep;
    straightFrames: number;
    blinkCount:     number;
    eyesOpen:       boolean;
    passed:         boolean;
}

export interface LivenessResult {
    state:       LivenessState;
    instruction: string;
}

// Thresholds — tune these if detection feels too sensitive/loose
const STRAIGHT_FRAMES_NEEDED = 20;   // ~0.7s at 30fps
const YAW_STRAIGHT_MAX       = 10;   // degrees
const PITCH_STRAIGHT_MAX     = 15;   // degrees
const YAW_TURN_THRESHOLD     = 15;   // degrees
const BLINK_EYE_THRESHOLD    = 0.3;  // below = eye closed
const SMILE_THRESHOLD        = 0.7;  // above = smiling
const BLINKS_NEEDED          = 2;

export class LivenessEngine {

    static initialState(): LivenessState {
        return {
            step:           LivenessStep.LOOK_STRAIGHT,
            straightFrames: 0,
            blinkCount:     0,
            eyesOpen:       true,
            passed:         false,
        };
    }

    static processFace(data: FaceData, state: LivenessState): LivenessResult {
        switch (state.step) {
            case LivenessStep.LOOK_STRAIGHT: return this.processLookStraight(data, state);
            case LivenessStep.BLINK:         return this.processBlink(data, state);
            case LivenessStep.HEAD_LEFT:     return this.processHeadLeft(data, state);
            case LivenessStep.HEAD_RIGHT:    return this.processHeadRight(data, state);
            case LivenessStep.SMILE:         return this.processSmile(data, state);
            case LivenessStep.PASSED:        return { state, instruction: 'Liveness Passed ✓' };
        }
    }

    private static processLookStraight(data: FaceData, state: LivenessState): LivenessResult {
        const isCentered =
            Math.abs(data.yawAngle)   < YAW_STRAIGHT_MAX &&
            Math.abs(data.pitchAngle) < PITCH_STRAIGHT_MAX;

        const frames = isCentered ? state.straightFrames + 1 : 0;
        const newState = { ...state, straightFrames: frames };

        if (frames >= STRAIGHT_FRAMES_NEEDED) {
            newState.step = LivenessStep.BLINK;
            return { state: newState, instruction: 'Blink Twice' };
        }

        return { state: newState, instruction: 'Look Straight at Camera' };
    }

    private static processBlink(data: FaceData, state: LivenessState): LivenessResult {
        const eyesOpen =
            (data.leftEyeOpenProbability  ?? 1) > BLINK_EYE_THRESHOLD &&
            (data.rightEyeOpenProbability ?? 1) > BLINK_EYE_THRESHOLD;

        const newState = { ...state, eyesOpen };

        // Count blink on reopen transition: closed → open
        if (!state.eyesOpen && eyesOpen) {
            newState.blinkCount = state.blinkCount + 1;
            if (newState.blinkCount >= BLINKS_NEEDED) {
                newState.step = LivenessStep.HEAD_LEFT;
                return { state: newState, instruction: 'Turn Head Left' };
            }
        }

        const remaining = BLINKS_NEEDED - newState.blinkCount;
        return {
            state: newState,
            instruction: remaining > 1 ? 'Blink Twice' : 'Blink Once More',
        };
    }

    private static processHeadLeft(data: FaceData, state: LivenessState): LivenessResult {
        if (data.yawAngle < -YAW_TURN_THRESHOLD) {
            return { state: { ...state, step: LivenessStep.HEAD_RIGHT }, instruction: 'Turn Head Right' };
        }
        return { state, instruction: 'Turn Head Left' };
    }

    private static processHeadRight(data: FaceData, state: LivenessState): LivenessResult {
        if (data.yawAngle > YAW_TURN_THRESHOLD) {
            return { state: { ...state, step: LivenessStep.SMILE }, instruction: 'Smile Please' };
        }
        return { state, instruction: 'Turn Head Right' };
    }

    private static processSmile(data: FaceData, state: LivenessState): LivenessResult {
        if ((data.smilingProbability ?? 0) > SMILE_THRESHOLD) {
            return {
                state: { ...state, step: LivenessStep.PASSED, passed: true },
                instruction: 'Liveness Passed ✓',
            };
        }
        return { state, instruction: 'Smile Please' };
    }
}
