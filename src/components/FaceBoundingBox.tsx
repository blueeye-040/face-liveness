import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Memoize component to prevent unnecessary re-renders
const FaceBoundingBox = memo(
  ({ x, y, width, height }: Props) => {
    return (
      <View
        style={[
          styles.box,
          {
            left: x,
            top: y,
            width,
            height,
          },
        ]}
      />
    );
  },
  // Custom comparison to prevent re-renders if props haven't changed
  (prevProps, nextProps) => {
    return (
      prevProps.x === nextProps.x &&
      prevProps.y === nextProps.y &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height
    );
  }
);

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#00FF00',
    borderRadius: 10,
  },
});

FaceBoundingBox.displayName = 'FaceBoundingBox';

export default FaceBoundingBox;