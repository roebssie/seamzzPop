import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Screen = 'home' | 'discover' | 'projects';
type ProjectSource = 'photo' | 'camera' | 'link';

type Measurements = {
  bust: string;
  waist: string;
  hips: string;
};

type Project = {
  id: string;
  title: string;
  source: ProjectSource;
  imageUri?: string;
  link?: string;
  notes: string;
  measurements: Measurements;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'seamzzpop.projects.v1';
const emptyMeasurements: Measurements = { bust: '', waist: '', hips: '' };

const colors = {
  ink: '#302A2A',
  muted: '#796E6D',
  cream: '#FFF9F4',
  blush: '#F6DDD7',
  coral: '#C8665A',
  sage: '#DCE8DC',
  white: '#FFFFFF',
  line: '#EADFD9',
  danger: '#9F4038',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [link, setLink] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) setProjects(JSON.parse(value) as Project[]);
      })
      .catch(() => setMessage('Saved projects could not be loaded.'))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects)).catch(() => {
      setMessage('This change could not be saved on the device.');
    });
  }, [loaded, projects]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3500);
  };

  const createProject = (input: Pick<Project, 'source' | 'imageUri' | 'link'>) => {
    const now = new Date().toISOString();
    const project: Project = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: 'New garment study',
      notes: '',
      measurements: { ...emptyMeasurements },
      createdAt: now,
      updatedAt: now,
      ...input,
    };

    setProjects((current) => [project, ...current]);
    setSelectedProjectId(project.id);
    setScreen('projects');
    showMessage('Project saved on this device.');
  };

  const preserveImage = (sourceUri: string) => {
    const directory = new Directory(Paths.document, 'project-images');
    if (!directory.exists) directory.create({ intermediates: true });
    const source = new File(sourceUri);
    const destination = new File(directory, `${Date.now()}${source.extension || '.jpg'}`);
    source.copy(destination);
    return destination.uri;
  };

  const addImageProject = async (source: 'camera' | 'photo') => {
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', `Please allow ${source === 'camera' ? 'camera' : 'photo library'} access to add inspiration.`);
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });

    if (!result.canceled) {
      try {
        createProject({ source, imageUri: preserveImage(result.assets[0].uri) });
      } catch {
        createProject({ source, imageUri: result.assets[0].uri });
        showMessage('Project saved, but its photo may need to be reselected later.');
      }
    }
  };

  const chooseImageSource = () => {
    Alert.alert('Add garment inspiration', 'Choose where the image should come from.', [
      { text: 'Camera', onPress: () => void addImageProject('camera') },
      { text: 'Photo library', onPress: () => void addImageProject('photo') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const addLinkProject = () => {
    const value = link.trim();
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
    } catch {
      showMessage('Please paste a complete http or https link.');
      return;
    }

    createProject({ source: 'link', link: value });
    setLink('');
  };

  const updateProject = (id: string, patch: Partial<Project>) => {
    setProjects((current) => current.map((project) => (
      project.id === id ? { ...project, ...patch, updatedAt: new Date().toISOString() } : project
    )));
  };

  const removeProject = (project: Project) => {
    Alert.alert('Delete this project?', 'Its notes and measurements will be removed from this device.', [
      { text: 'Keep project', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (project.imageUri?.startsWith(Paths.document.uri)) {
            const file = new File(project.imageUri);
            if (file.exists) file.delete();
          }
          setProjects((current) => current.filter((item) => item.id !== project.id));
          setSelectedProjectId(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header projectCount={projects.length} />
          {message ? <View style={styles.message}><Text style={styles.messageText}>{message}</Text></View> : null}

          {screen === 'home' && (
            <HomeScreen
              link={link}
              setLink={setLink}
              onAddImage={chooseImageSource}
              onAddLink={addLinkProject}
              onDiscover={() => setScreen('discover')}
            />
          )}
          {screen === 'discover' && <DiscoverScreen />}
          {screen === 'projects' && (
            <ProjectsScreen
              projects={projects}
              selectedProject={selectedProject}
              onSelect={setSelectedProjectId}
              onBack={() => setSelectedProjectId(null)}
              onUpdate={updateProject}
              onDelete={removeProject}
              onCreate={() => setScreen('home')}
            />
          )}
        </ScrollView>

        <View style={styles.tabBar}>
          <TabButton icon="✦" label="Inspire" active={screen === 'home'} onPress={() => setScreen('home')} />
          <TabButton icon="⌕" label="Discover" active={screen === 'discover'} onPress={() => setScreen('discover')} />
          <TabButton icon="▱" label={`Projects${projects.length ? ` · ${projects.length}` : ''}`} active={screen === 'projects'} onPress={() => setScreen('projects')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Header({ projectCount }: { projectCount: number }) {
  return <View style={styles.header}><View><Text style={styles.eyebrow}>YOUR SEWING SIDEKICK</Text><Text style={styles.logo}>seamzzPop</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{projectCount}</Text></View></View>;
}

function HomeScreen({ link, setLink, onAddImage, onAddLink, onDiscover }: {
  link: string;
  setLink: (value: string) => void;
  onAddImage: () => void;
  onAddLink: () => void;
  onDiscover: () => void;
}) {
  return <><View style={styles.hero}><Text style={styles.heroTitle}>Make the look.<Text style={styles.heroAccent}> Make it yours.</Text></Text><Text style={styles.heroBody}>Save garment inspiration and shape it into an organized sewing project.</Text></View><View style={styles.card}><View style={styles.cardHeadingRow}><Text style={styles.cardTitle}>Bring in inspiration</Text><Text style={styles.thread}>✺</Text></View><Text style={styles.cardBody}>Take a photo, choose one from your library, or paste a link you have permission to analyse.</Text><Pressable accessibilityRole="button" style={styles.uploadButton} onPress={onAddImage}><Text style={styles.uploadIcon}>＋</Text><View><Text style={styles.uploadTitle}>Add a garment photo</Text><Text style={styles.uploadSub}>Camera or photo library</Text></View></Pressable><View style={styles.orRow}><View style={styles.rule} /><Text style={styles.orText}>OR PASTE A LINK</Text><View style={styles.rule} /></View><TextInput value={link} onChangeText={setLink} placeholder="https://..." placeholderTextColor="#A89B98" autoCapitalize="none" keyboardType="url" style={styles.input} /><Pressable accessibilityRole="button" disabled={!link.trim()} style={[styles.primaryButton, !link.trim() && styles.primaryButtonMuted]} onPress={onAddLink}><Text style={styles.primaryButtonText}>Create link project</Text><Text style={styles.arrow}>→</Text></Pressable></View><View style={styles.sectionHeading}><Text style={styles.sectionTitle}>What happens next?</Text><Pressable onPress={onDiscover}><Text style={styles.seeAll}>See discovery →</Text></Pressable></View><View style={styles.stepsRow}><Step number="01" title="Collect" text="Save inspiration" /><Step number="02" title="Plan" text="Add notes & fit" /><Step number="03" title="Discover" text="Find legal patterns" /></View><View style={styles.futureNote}><Text style={styles.futureIcon}>🧵</Text><View style={{ flex: 1 }}><Text style={styles.futureTitle}>Honest by design</Text><Text style={styles.futureText}>Project organization works locally now. Garment recognition and pattern drafting are still planned features.</Text></View></View></>;
}

function DiscoverScreen() {
  return <><Text style={styles.pageTitle}>Pattern discovery</Text><Text style={styles.pageIntro}>This area will connect projects to open, licensed, public-domain or creator-authorized patterns.</Text><View style={styles.emptyCard}><Text style={styles.emptyEmoji}>✂️</Text><Text style={styles.emptyTitle}>The catalog is being stitched together</Text><Text style={styles.emptyText}>Matches will explain their silhouette, neckline, sleeve and construction similarities—and always show source rights.</Text><Text style={styles.pill}>PLANNED FEATURE</Text></View></>;
}

function ProjectsScreen({ projects, selectedProject, onSelect, onBack, onUpdate, onDelete, onCreate }: {
  projects: Project[];
  selectedProject: Project | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onUpdate: (id: string, patch: Partial<Project>) => void;
  onDelete: (project: Project) => void;
  onCreate: () => void;
}) {
  if (selectedProject) {
    return <ProjectEditor project={selectedProject} onBack={onBack} onUpdate={onUpdate} onDelete={onDelete} />;
  }

  return <><View style={styles.pageHeadingRow}><View style={{ flex: 1 }}><Text style={styles.pageTitle}>Your projects</Text><Text style={styles.pageIntro}>{projects.length ? `${projects.length} saved on this device` : 'Notes, measurements and inspiration live here.'}</Text></View><Pressable style={styles.smallButton} onPress={onCreate}><Text style={styles.smallButtonText}>＋ New</Text></Pressable></View>{projects.length ? projects.map((project) => <Pressable key={project.id} style={styles.projectCard} onPress={() => onSelect(project.id)}>{project.imageUri ? <Image source={{ uri: project.imageUri }} style={styles.projectThumb} /> : <View style={styles.linkPreview}><Text style={styles.linkPreviewIcon}>↗</Text></View>}<View style={styles.projectDetails}><Text style={styles.projectKicker}>{project.source === 'link' ? 'SAVED LINK' : project.source === 'camera' ? 'CAMERA PHOTO' : 'INSPIRATION PHOTO'}</Text><Text style={styles.projectTitle}>{project.title}</Text><Text numberOfLines={2} style={styles.projectText}>{project.notes || 'Add sewing notes and measurements.'}</Text></View></Pressable>) : <View style={styles.emptyCard}><Text style={styles.emptyEmoji}>◌</Text><Text style={styles.emptyTitle}>No projects yet</Text><Text style={styles.emptyText}>Add a photo or link from Inspire to start one.</Text></View>}</>;
}

function ProjectEditor({ project, onBack, onUpdate, onDelete }: {
  project: Project;
  onBack: () => void;
  onUpdate: (id: string, patch: Partial<Project>) => void;
  onDelete: (project: Project) => void;
}) {
  const updateMeasurement = (key: keyof Measurements, value: string) => onUpdate(project.id, { measurements: { ...project.measurements, [key]: value } });
  return <><Pressable onPress={onBack}><Text style={styles.backLink}>← All projects</Text></Pressable>{project.imageUri ? <Image source={{ uri: project.imageUri }} style={styles.editorImage} /> : <View style={styles.editorLink}><Text style={styles.editorLinkTitle}>Saved inspiration link</Text><Text numberOfLines={2} style={styles.editorLinkText}>{project.link}</Text></View>}<Text style={styles.fieldLabel}>PROJECT NAME</Text><TextInput style={styles.editorInput} value={project.title} onChangeText={(title) => onUpdate(project.id, { title })} /><Text style={styles.fieldLabel}>SEWING NOTES</Text><TextInput style={[styles.editorInput, styles.notesInput]} value={project.notes} onChangeText={(notes) => onUpdate(project.id, { notes })} placeholder="Fabric ideas, changes, construction notes…" placeholderTextColor="#A89B98" multiline /><Text style={styles.measurementTitle}>Body measurements</Text><Text style={styles.measurementHint}>Optional values in centimetres. These do not generate a pattern yet.</Text><View style={styles.measurementRow}><MeasurementField label="Bust" value={project.measurements.bust} onChange={(value) => updateMeasurement('bust', value)} /><MeasurementField label="Waist" value={project.measurements.waist} onChange={(value) => updateMeasurement('waist', value)} /><MeasurementField label="Hips" value={project.measurements.hips} onChange={(value) => updateMeasurement('hips', value)} /></View><View style={styles.savedNote}><Text style={styles.savedNoteText}>Changes save automatically on this device.</Text></View><Pressable style={styles.deleteButton} onPress={() => onDelete(project)}><Text style={styles.deleteButtonText}>Delete project</Text></Pressable></>;
}

function MeasurementField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <View style={styles.measurementField}><Text style={styles.measurementLabel}>{label}</Text><TextInput style={styles.measurementInput} value={value} onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="—" placeholderTextColor="#A89B98" /></View>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <View style={styles.step}><Text style={styles.stepNumber}>{number}</Text><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepText}>{text}</Text></View>;
}

function TabButton({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.tab}><Text style={[styles.tabIcon, active && styles.tabActive]}>{icon}</Text><Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream }, shell: { flex: 1, backgroundColor: colors.cream }, content: { padding: 24, paddingBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }, eyebrow: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 }, logo: { color: colors.ink, fontSize: 26, fontWeight: '800', letterSpacing: -1 }, avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.coral, fontWeight: '800' },
  message: { backgroundColor: colors.sage, padding: 12, borderRadius: 12, marginBottom: 18 }, messageText: { color: colors.ink, fontSize: 13, textAlign: 'center', fontWeight: '600' },
  hero: { marginBottom: 24 }, heroTitle: { color: colors.ink, fontSize: 38, lineHeight: 42, fontWeight: '800', letterSpacing: -1.4 }, heroAccent: { color: colors.coral }, heroBody: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 340 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.line, shadowColor: '#BBAAA3', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 }, cardHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' }, thread: { color: colors.coral, fontSize: 25 }, cardBody: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  uploadButton: { backgroundColor: colors.blush, borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }, uploadIcon: { color: colors.coral, fontSize: 27, fontWeight: '300' }, uploadTitle: { color: colors.ink, fontWeight: '700', fontSize: 14 }, uploadSub: { color: colors.muted, fontSize: 12, marginTop: 2 }, orRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 17 }, rule: { flex: 1, height: 1, backgroundColor: colors.line }, orText: { color: '#A89B98', fontSize: 9, fontWeight: '800', letterSpacing: 1 }, input: { borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontSize: 14 },
  primaryButton: { backgroundColor: colors.coral, borderRadius: 12, padding: 14, marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }, primaryButtonMuted: { opacity: 0.45 }, primaryButtonText: { color: colors.white, fontWeight: '800', fontSize: 14 }, arrow: { color: colors.white, fontSize: 18 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 30, marginBottom: 14 }, sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' }, seeAll: { color: colors.coral, fontSize: 12, fontWeight: '700' }, stepsRow: { flexDirection: 'row', gap: 10 }, step: { flex: 1, backgroundColor: colors.sage, borderRadius: 16, padding: 13, minHeight: 112 }, stepNumber: { color: colors.coral, fontSize: 11, fontWeight: '800', marginBottom: 10 }, stepTitle: { color: colors.ink, fontWeight: '800', fontSize: 14, marginBottom: 5 }, stepText: { color: colors.muted, fontSize: 11, lineHeight: 15 },
  futureNote: { flexDirection: 'row', gap: 12, backgroundColor: '#F4EEE8', padding: 16, borderRadius: 18, marginTop: 18 }, futureIcon: { fontSize: 24 }, futureTitle: { color: colors.ink, fontWeight: '800', fontSize: 13, marginBottom: 4 }, futureText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  pageHeadingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, pageTitle: { color: colors.ink, fontSize: 32, fontWeight: '800', marginBottom: 8 }, pageIntro: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 20 }, smallButton: { backgroundColor: colors.coral, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12 }, smallButtonText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  emptyCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: colors.line }, emptyEmoji: { fontSize: 38, marginBottom: 16 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 }, emptyText: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' }, pill: { backgroundColor: colors.blush, color: colors.coral, fontSize: 9, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, marginTop: 18, overflow: 'hidden' },
  projectCard: { backgroundColor: colors.white, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, marginBottom: 15, flexDirection: 'row', minHeight: 126 }, projectThumb: { width: 112, minHeight: 126, backgroundColor: colors.blush }, linkPreview: { width: 112, minHeight: 126, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' }, linkPreviewIcon: { color: colors.coral, fontSize: 38 }, projectDetails: { padding: 15, flex: 1, justifyContent: 'center' }, projectKicker: { color: colors.coral, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 }, projectTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 5 }, projectText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  backLink: { color: colors.coral, fontWeight: '800', marginBottom: 16 }, editorImage: { width: '100%', height: 270, borderRadius: 22, backgroundColor: colors.blush, marginBottom: 20 }, editorLink: { backgroundColor: colors.blush, borderRadius: 20, padding: 20, marginBottom: 20 }, editorLinkTitle: { color: colors.ink, fontWeight: '800', marginBottom: 6 }, editorLinkText: { color: colors.muted, fontSize: 13 }, fieldLabel: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 7, marginTop: 10 }, editorInput: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 13, padding: 13, color: colors.ink, fontSize: 15 }, notesInput: { minHeight: 110, textAlignVertical: 'top' }, measurementTitle: { color: colors.ink, fontSize: 19, fontWeight: '800', marginTop: 24 }, measurementHint: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 5, marginBottom: 13 }, measurementRow: { flexDirection: 'row', gap: 10 }, measurementField: { flex: 1 }, measurementLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginBottom: 5 }, measurementInput: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 12, color: colors.ink, textAlign: 'center' }, savedNote: { backgroundColor: colors.sage, padding: 12, borderRadius: 12, marginTop: 18 }, savedNoteText: { color: colors.ink, fontSize: 12, textAlign: 'center' }, deleteButton: { borderColor: '#E8B9B4', borderWidth: 1, padding: 13, borderRadius: 12, marginTop: 28 }, deleteButtonText: { color: colors.danger, textAlign: 'center', fontWeight: '800' },
  tabBar: { minHeight: 76, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 11, paddingBottom: 8 }, tab: { alignItems: 'center', gap: 3, minWidth: 82 }, tabIcon: { color: '#B7AAA5', fontSize: 23, lineHeight: 25 }, tabLabel: { color: '#9A8E8A', fontSize: 11, fontWeight: '700' }, tabActive: { color: colors.coral },
});
