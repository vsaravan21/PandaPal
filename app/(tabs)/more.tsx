import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.placeholder}>Content goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0eeee',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  placeholder: {
    marginTop: 12,
    fontSize: 15,
    color: '#8E8E93',
    letterSpacing: 0.2,
  },
});
