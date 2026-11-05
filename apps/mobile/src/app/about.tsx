import Constants from 'expo-constants';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { strings } from '@/content/strings';
import { PRIVACY_POLICY_URL } from '@/config';
import { radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

/** Version, privacy and the disclaimers (SET-2, PRD section 16). */
export default function AboutScreen() {
  const { colors } = useTheme();
  const version = Constants.expoConfig?.version ?? '';
  const privacyUrl = PRIVACY_POLICY_URL;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <Text accessibilityRole="header" style={[type.display, { color: colors.ink }]}>
        {strings.appName}
      </Text>
      {version ? (
        <Text style={[type.smallStrong, { color: colors.ink2 }]} testID="version">
          {strings.about.version(version)}
        </Text>
      ) : null}
      <Text style={[type.body, { color: colors.ink }]}>{strings.about.tagline}</Text>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={[type.title, { color: colors.ink }]}>
          {strings.about.privacyTitle}
        </Text>
        <Text style={[type.body, { color: colors.ink }]}>{strings.about.privacyBody}</Text>
        {privacyUrl ? (
          <Button
            label={strings.about.privacyLink}
            onPress={() => void Linking.openURL(privacyUrl)}
            testID="privacy-link"
            variant="quiet"
          />
        ) : null}
      </View>

      <View style={[styles.notice, { borderColor: colors.line, backgroundColor: colors.surface }]}>
        <Text accessibilityRole="header" style={[type.heading, { color: colors.ink }]}>
          {strings.about.noticeTitle}
        </Text>
        <Text style={[type.body, { color: colors.ink }]} testID="notice">
          {strings.about.notice}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: space.md, gap: space.md },
  section: { gap: space.sm },
  notice: { borderWidth: 1.5, borderRadius: radius.md, padding: space.md, gap: space.xs },
});
