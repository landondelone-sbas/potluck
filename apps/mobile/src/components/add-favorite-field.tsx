import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { MAX_NAME_LENGTH } from '@/domain/favorites';
import { minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

import { Button } from './button';

interface AddFavoriteFieldProps {
  label: string;
  placeholder: string;
  buttonLabel: string;
  /** Called with the typed text. Return true when it was accepted, so the field clears. */
  onSubmit: (text: string) => boolean;
  autoFocus?: boolean;
  testID?: string;
}

/** A text field and an Add button, for typing in a favorite (ONB-3, PAN-3). */
export function AddFavoriteField({
  label,
  placeholder,
  buttonLabel,
  onSubmit,
  autoFocus = false,
  testID,
}: AddFavoriteFieldProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');

  const submit = () => {
    if (onSubmit(text)) setText('');
  };

  return (
    <View style={styles.row}>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="sentences"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={MAX_NAME_LENGTH}
        onChangeText={setText}
        onSubmitEditing={submit}
        placeholder={placeholder}
        placeholderTextColor={colors.ink2}
        returnKeyType="done"
        style={[
          type.body,
          styles.input,
          { color: colors.ink, backgroundColor: colors.surface, borderColor: colors.line },
        ]}
        testID={testID ? `${testID}-input` : undefined}
        value={text}
      />
      <Button
        label={buttonLabel}
        onPress={submit}
        testID={testID ? `${testID}-button` : undefined}
        variant="quiet"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm, alignItems: 'stretch' },
  input: {
    flex: 1,
    minHeight: minTouchTarget,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
  },
});
