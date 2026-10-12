import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Screen = 'home' | 'discover' | 'projects';

const colors = {
  ink: '#302A2A',
  muted: '#796E6D',
  cream: '#FFF9F4',
  blush: '#F6DDD7',
  coral: '#C8665A',
  sage: '#DCE8DC',
  white: '#FFFFFF',
  line: '#EADFD9',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [link, setLink] = useState('');
  const [showNotice, setShowNotice] = useState(false);

  const handleAnalyze = () => {
    setShowNotice(true);
    setTimeout(() => setShowNotice(false), 3500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>YOUR SEWING SIDEKICK</Text>
              <Text style={styles.logo}>seamzzPop</Text>
            </View>
            <View style={styles.avatar}><Text style={styles.avatarText}>R</Text></View>
          </View>

          {screen === 'home' && (
            <HomeScreen
              link={link}
              setLink={setLink}
              onAnalyze={handleAnalyze}
              showNotice={showNotice}
              onDiscover={() => setScreen('discover')}
            />
          )}
          {screen === 'discover' && <DiscoverScreen />}
          {screen === 'projects' && <ProjectsScreen />}
        </ScrollView>

        <View style={styles.tabBar}>
          <TabButton icon="✦" label="Inspire" active={screen === 'home'} onPress={() => setScreen('home')} />
          <TabButton icon="⌕" label="Discover" active={screen === 'discover'} onPress={() => setScreen('discover')} />
          <TabButton icon="▱" label="Projects" active={screen === 'projects'} onPress={() => setScreen('projects')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({ link, setLink, onAnalyze, showNotice, onDiscover }: {
  link: string;
  setLink: (value: string) => void;
  onAnalyze: () => void;
  showNotice: boolean;
  onDiscover: () => void;
}) {
  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Make the look.
          <Text style={styles.heroAccent}> Make it yours.</Text>
        </Text>
        <Text style={styles.heroBody}>Save a garment that inspires you and turn the idea into a thoughtful sewing project.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeadingRow}>
          <Text style={styles.cardTitle}>Bring in inspiration</Text>
          <Text style={styles.thread}>✺</Text>
        </View>
        <Text style={styles.cardBody}>Add a photo from your camera roll, or paste a link you have permission to analyse.</Text>
        <Pressable style={styles.uploadButton} onPress={() => {}}>
          <Text style={styles.uploadIcon}>＋</Text>
          <View><Text style={styles.uploadTitle}>Upload a garment photo</Text><Text style={styles.uploadSub}>Camera or photo library</Text></View>
        </Pressable>
        <View style={styles.orRow}><View style={styles.rule} /><Text style={styles.orText}>OR PASTE A LINK</Text><View style={styles.rule} /></View>
        <TextInput
          value={link}
          onChangeText={setLink}
          placeholder="https://..."
          placeholderTextColor="#A89B98"
          autoCapitalize="none"
          style={styles.input}
        />
        <Pressable style={[styles.primaryButton, !link && styles.primaryButtonMuted]} onPress={onAnalyze}>
          <Text style={styles.primaryButtonText}>Save for later</Text><Text style={styles.arrow}>→</Text>
        </Pressable>
        {showNotice && <Text style={styles.notice}>Saved as a project placeholder. Analysis is coming in a future release.</Text>}
      </View>

      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>What happens next?</Text><Pressable onPress={onDiscover}><Text style={styles.seeAll}>See discovery →</Text></Pressable></View>
      <View style={styles.stepsRow}>
        <Step number="01" title="Describe" text="Review garment details" />
        <Step number="02" title="Discover" text="Find permitted patterns" />
        <Step number="03" title="Draft" text="Adjust when supported" />
      </View>
      <View style={styles.futureNote}><Text style={styles.futureIcon}>🧵</Text><View style={{ flex: 1 }}><Text style={styles.futureTitle}>A note from the workroom</Text><Text style={styles.futureText}>Pattern recognition and parametric drafting are planned, not live yet. Every future result will show its assumptions.</Text></View></View>
    </>
  );
}

function DiscoverScreen() {
  return <><Text style={styles.pageTitle}>Pattern discovery</Text><Text style={styles.pageIntro}>A future home for patterns that are open, licensed, public-domain, or creator-authorized.</Text><View style={styles.emptyCard}><Text style={styles.emptyEmoji}>✂️</Text><Text style={styles.emptyTitle}>The catalog is being stitched together</Text><Text style={styles.emptyText}>We’ll start with transparent matches based on silhouette, neckline, sleeve, and construction details.</Text><Text style={styles.pill}>COMING IN THE FOUNDATION PHASE</Text></View></>;
}

function ProjectsScreen() {
  return <><Text style={styles.pageTitle}>Your projects</Text><Text style={styles.pageIntro}>Keep inspiration, notes, measurements, and future pattern exports together.</Text><View style={styles.emptyCard}><Text style={styles.emptyEmoji}>◌</Text><Text style={styles.emptyTitle}>No projects yet</Text><Text style={styles.emptyText}>Save an inspiration link or photo from the Inspire tab to start a project.</Text></View></>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <View style={styles.step}><Text style={styles.stepNumber}>{number}</Text><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepText}>{text}</Text></View>;
}

function TabButton({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.tab}><Text style={[styles.tabIcon, active && styles.tabActive]}>{icon}</Text><Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  shell: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 24, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 34 },
  eyebrow: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  logo: { color: colors.ink, fontSize: 26, fontWeight: '800', letterSpacing: -1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.coral, fontWeight: '800' },
  hero: { marginBottom: 24 },
  heroTitle: { color: colors.ink, fontSize: 38, lineHeight: 42, fontWeight: '800', letterSpacing: -1.4 },
  heroAccent: { color: colors.coral },
  heroBody: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 340 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.line, shadowColor: '#BBAAA3', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  cardHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  thread: { color: colors.coral, fontSize: 25 },
  cardBody: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  uploadButton: { backgroundColor: colors.blush, borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  uploadIcon: { color: colors.coral, fontSize: 27, fontWeight: '300' },
  uploadTitle: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  uploadSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 17 },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  orText: { color: '#A89B98', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  input: { borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontSize: 14 },
  primaryButton: { backgroundColor: colors.coral, borderRadius: 12, padding: 14, marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryButtonMuted: { opacity: 0.8 },
  primaryButtonText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  arrow: { color: colors.white, fontSize: 18 },
  notice: { color: colors.coral, fontSize: 12, lineHeight: 17, marginTop: 11, textAlign: 'center' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 30, marginBottom: 14 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  seeAll: { color: colors.coral, fontSize: 12, fontWeight: '700' },
  stepsRow: { flexDirection: 'row', gap: 10 },
  step: { flex: 1, backgroundColor: colors.sage, borderRadius: 16, padding: 13, minHeight: 112 },
  stepNumber: { color: colors.coral, fontSize: 11, fontWeight: '800', marginBottom: 10 },
  stepTitle: { color: colors.ink, fontWeight: '800', fontSize: 14, marginBottom: 5 },
  stepText: { color: colors.muted, fontSize: 11, lineHeight: 15 },
  futureNote: { flexDirection: 'row', gap: 12, backgroundColor: '#F4EEE8', padding: 16, borderRadius: 18, marginTop: 18 },
  futureIcon: { fontSize: 24 },
  futureTitle: { color: colors.ink, fontWeight: '800', fontSize: 13, marginBottom: 4 },
  futureText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  pageTitle: { color: colors.ink, fontSize: 32, fontWeight: '800', marginBottom: 12 },
  pageIntro: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: 24 },
  emptyCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: colors.line },
  emptyEmoji: { fontSize: 38, marginBottom: 16 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  pill: { backgroundColor: colors.blush, color: colors.coral, fontSize: 9, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, marginTop: 18, overflow: 'hidden' },
  tabBar: { height: 76, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 11 },
  tab: { alignItems: 'center', gap: 3, minWidth: 70 },
  tabIcon: { color: '#B7AAA5', fontSize: 23, lineHeight: 25 },
  tabLabel: { color: '#9A8E8A', fontSize: 11, fontWeight: '700' },
  tabActive: { color: colors.coral },
});
