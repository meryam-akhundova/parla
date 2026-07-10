import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Tag } from '../components/Tag';
import { HintBox } from '../components/HintBox';
import { WordCard } from '../components/WordCard';
import { colors, spacing } from '../theme/theme';

type RootStackParamList = {
  Home: undefined;
  Quiz: undefined;
};

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.preview}>
        <WordCard
            word="selam"
            romanization="seh-lahm"
            meaning="hey / hi (casual)"
            exampleMessage="selam naber?"
            exampleTranslation="hey, what's up?"
            category="slang"
            categoryVariant="purple"
        />
        <HintBox message="turks use this with close friends — saying it to a stranger would sound rude." />
        <Tag label="istanbul" variant="teal" />
        <Tag label="expression" variant="coral" />
        <Tag label="filler" variant="amber" />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    preview: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: spacing.lg,
        gap: spacing.lg,
    },
  });