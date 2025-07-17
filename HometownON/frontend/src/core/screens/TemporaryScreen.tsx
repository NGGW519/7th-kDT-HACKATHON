import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TemporaryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>페이지 있어요? 아니 없어요.</Text>
      <Text style={styles.text}>없었어요? 없어요.</Text>
      <Text style={styles.text}>없었어요? 아니 없어요!</Text>
      <Text style={styles.text}>아 있었는데? 아니 없어요 그냥.</Text>
    </View>
  );
};

import { styles } from './TemporaryScreen.styles';

export default TemporaryScreen;
