import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function LearnScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Learn</Text>
      <Text style={styles.placeholder}>Content goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.6,
  },
});
