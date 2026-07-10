import { View, Text, StyleSheet } from 'react-native';

export function QuizScreen() {
  return (
    <View style={styles.container}>
      <Text>quiz</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});