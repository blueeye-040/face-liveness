import React from 'react';
import { Animated, StyleSheet } from 'react-native';

interface Props {
  pos: Animated.ValueXY;
  opacity: Animated.Value;
  width: number;
  height: number;
}

export default function FaceBoundingBox({ pos, opacity, width, height }: Props) {
  return (
    <Animated.View
      style={[
        styles.box,
        {
          opacity,
          width,
          height,
          transform: pos.getTranslateTransform(),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#00FF00',
    borderRadius: 10,
  },
});
