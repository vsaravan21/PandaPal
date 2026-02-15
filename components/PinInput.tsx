import React, { useRef, useCallback } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  masked?: boolean;
  editable?: boolean;
};

export function PinInput({ length = 4, value, onChange, masked = true, editable = true }: Props) {
  const refs = useRef<(TextInput | null)[]>([]);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = useCallback(
    (index: number, char: string) => {
      const digitsOnly = char.replace(/\D/g, '');
      if (!digitsOnly && char !== '') return;
      const current = value.split('');
      if (digitsOnly.length > 1) {
        for (let i = 0; i < digitsOnly.length && index + i < length; i++) {
          current[index + i] = digitsOnly[i];
        }
      } else {
        current[index] = digitsOnly.slice(-1);
      }
      const joined = current.join('').slice(0, length);
      onChange(joined);
      const nextFocus = Math.min(index + (digitsOnly.length > 1 ? digitsOnly.length : 1), length - 1);
      refs.current[nextFocus]?.focus();
    },
    [value, length, onChange]
  );

  const handleKeyPress = useCallback(
    (index: number, e: { nativeEvent: { key: string } }) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
        const next = value.split('').slice(0, index);
        onChange(next.join(''));
        refs.current[index - 1]?.focus();
      }
    },
    [value, digits, length, onChange]
  );

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          style={styles.box}
          value={digits[i] ?? ''}
          onChangeText={(char) => handleChange(i, char)}
          onKeyPress={(e) => handleKeyPress(i, e)}
          keyboardType="number-pad"
          maxLength={i === 0 ? length : 1}
          secureTextEntry={masked}
          editable={editable}
          selectTextOnFocus
          accessibilityLabel={`Digit ${i + 1}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 8,
  },
  box: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(139, 195, 74, 0.4)',
    backgroundColor: '#fff',
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    textAlign: 'center',
    padding: 0,
  },
});
