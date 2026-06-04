export enum HeadDirection {
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
}

export class LivenessEngine {
  static getHeadDirection(
    yawAngle: number,
  ): HeadDirection {
    if (yawAngle < -15) {
      return HeadDirection.LEFT;
    }

    if (yawAngle > 15) {
      return HeadDirection.RIGHT;
    }

    return HeadDirection.CENTER;
  }
}