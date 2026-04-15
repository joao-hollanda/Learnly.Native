import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Bolinha({ cor = 'red', tamanho }) {
  const size = tamanho === 'pequena' ? 8 : 13;
  return (
    <View style={styles.container}>
      <View style={[styles.bolinha, { backgroundColor: cor, width: size, height: size }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bolinha: {
    borderRadius: 999,
  },
});
