import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import FolderModal from './FolderModal';
import LoginScreen from './login';

const Drawer = createDrawerNavigator();

const initialFiles = [
  { id: '1', name: 'Project Docs.pdf', timestamp: 'Feb 19, 2025', icon: 'document-text-outline' },
  { id: '2', name: 'Design Mockups.png', timestamp: 'Feb 18, 2025', icon: 'image-outline' },
  { id: '3', name: 'App Code.zip', timestamp: 'Feb 15, 2025', icon: 'file-tray-outline' },
  { id: '4', name: 'Meeting Notes.txt', timestamp: 'Feb 10, 2025', icon: 'document-outline' },
];

function HomeScreen({ navigation }) {
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState(initialFiles);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.timestamp.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
    );
  };

  const openFile = (fileName) => {
    console.log(`Opening file: ${fileName}`);
  };

  const confirmCreateFolder = () => {
    if (selectedFiles.length > 0 && newFolderName.trim()) {
      const newFolder = {
        id: Date.now().toString(),
        name: newFolderName,
        timestamp: new Date().toLocaleDateString(),
        icon: 'folder-outline',
      };
      setFiles((prevFiles) => [...prevFiles, newFolder]);
      setSelectedFiles([]);
      setModalVisible(false);
      setNewFolderName('');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="white" />
        <TextInput
          placeholder="Search files..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.header}>
        <ThemedText type="title">My Files</ThemedText>
        <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
          <Ionicons name={isGridView ? 'grid-outline' : 'list-outline'} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {selectedFiles.length > 0 && (
        <TouchableOpacity style={styles.folderButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="folder-outline" size={20} color="white" />
          <ThemedText>Create Folder</ThemedText>
        </TouchableOpacity>
      )}

      <FlatList
        data={filteredFiles}
        key={isGridView ? 'grid' : 'list'}
        numColumns={isGridView ? 2 : 1}
        renderItem={({ item }) => (
          <View style={[styles.fileCard, isGridView && styles.gridItem]}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={selectedFiles.includes(item.id)}
                onValueChange={() => toggleSelection(item.id)}
                color={selectedFiles.includes(item.id) ? '#007AFF' : undefined}
              />
            </View>
            <TouchableOpacity onPress={() => openFile(item.name)}>
              <Ionicons name={item.icon} size={28} color="#ffcc00" />
              <ThemedText>{item.name}</ThemedText>
              <ThemedText type="secondary">{item.timestamp}</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <TouchableOpacity style={styles.uploadButton}>
        <Ionicons name="cloud-upload-outline" size={24} color="white" />
      </TouchableOpacity>

      <FolderModal
        visible={modalVisible}
        folderName={newFolderName}
        onChangeFolderName={setNewFolderName}
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmCreateFolder}
      />
    </ThemedView>
  );
}

function SidebarContent({ navigation }) {
  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.sidebarItem} onPress={() => console.log('Logging out')}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <ThemedText>Logout</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <SidebarContent {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  menuButton: { position: 'absolute', top: 20, left: 20, zIndex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 10, borderRadius: 10, marginBottom: 12, marginTop: 50 },
  searchInput: { flex: 1, color: 'white', marginLeft: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  folderButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', padding: 12, borderRadius: 8, justifyContent: 'center', marginBottom: 12 },
  fileCard: { flex: 1, backgroundColor: '#1E1E1E', padding: 16, borderRadius: 10, margin: 8, alignItems: 'center', position: 'relative' },
  gridItem: { flexBasis: '48%' },
  checkboxContainer: { position: 'absolute', top: 8, left: 8 },
  uploadButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#007AFF', padding: 12, borderRadius: 50, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  sidebar: { flex: 1, backgroundColor: '#1E1E1E', padding: 20 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
});
