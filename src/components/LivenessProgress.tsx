import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  instruction: string;
}

export default function LivenessProgress({
  instruction,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {instruction}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});