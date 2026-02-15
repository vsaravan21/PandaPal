import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
};

export function SectionCard({ title, count, children, defaultExpanded = true }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((e) => !e)}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>{count} item{count !== 1 ? 's' : ''}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="#6B6B7B"
        />
      </Pressable>
      {expanded ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerLeft: {},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  count: {
    fontSize: 13,
    color: '#6B6B7B',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },
});
