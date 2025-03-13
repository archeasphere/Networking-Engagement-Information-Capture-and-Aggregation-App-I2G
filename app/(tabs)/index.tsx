import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import TagModal from './TagModal';
import LoginScreen from './login';
import SidebarContent from './SidebarContent'; // Import SidebarContent
import { setBackgroundColorAsync } from 'expo-system-ui';
import { Colors } from '@/constants/Colors';

const Drawer = createDrawerNavigator();

const initialFiles = [
  { id: '1', name: 'Project Docs.pdf', timestamp: new Date('2025-02-19T00:00:00Z').toUTCString(), icon: 'document-text-outline', type: 'file' },
  { id: '2', name: 'Design Mockups.png', timestamp: new Date('2025-02-18T00:00:00Z').toUTCString(), icon: 'image-outline', type: 'file' },
  { id: '3', name: 'App Code.zip', timestamp: new Date('2025-02-15T00:00:00Z').toUTCString(), icon: 'file-tray-outline', type: 'file' },
  { id: '4', name: 'Meeting Notes.txt', timestamp: new Date('2025-02-10T00:00:00Z').toUTCString(), icon: 'document-outline', type: 'file' },
];

const initialLabels = [
  { id: 'l1', name: 'Important', timestamp: new Date('2025-02-20T00:00:00Z').toUTCString(), icon: 'pricetag-outline', type: 'label' },
  { id: 'l2', name: 'Work', timestamp: new Date('2025-02-17T00:00:00Z').toUTCString(), icon: 'pricetag-outline', type: 'label' },
];

function HomeScreen({ navigation }) {
  const [isGridView, setIsGridView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState(initialFiles);
  const [labels, setLabels] = useState(initialLabels);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id, type) => {
    if (type === 'file') {
      setSelectedFiles((prev) =>
        prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
      );
    }
  };

  const confirmCreateTag = () => {
    if (selectedFiles.length > 0 && newTagName.trim()) {
      const newTag = {
        id: 'l' + Date.now().toString(),
        name: newTagName,
        timestamp: new Date().toUTCString(),
        icon: 'pricetag-outline',
        type: 'label'
      };
      setLabels((prevLabels) => [...prevLabels, newTag]);
      setSelectedFiles([]);
      setModalVisible(false);
      setNewTagName('');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[isGridView ? styles.gridItem : styles.rowItem]}>
      <Checkbox
        value={selectedFiles.includes(item.id)}
        onValueChange={() => toggleSelection(item.id, item.type)}
        color={selectedFiles.includes(item.id) ? '#5A42F5' : undefined}
      />
      <Ionicons name={item.icon} size={28} color={item.type === 'label' ? '#FF6B6B' : '#4C8CFF'} style={styles.fileIcon} />
      <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.fileName}>{item.name}</ThemedText>
      {!isGridView && <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>}
      {isGridView && <View style={styles.thumbnail} />}
      {isGridView && <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>}
      <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" style={styles.menuIcon} />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#B0B0B0" />
        <TextInput
          placeholder="Search files and labels..."
          placeholderTextColor="#B0B0B0"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {selectedFiles.length > 0 && (
        <TouchableOpacity style={styles.tagButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="pricetag-outline" size={20} color="#FFFFFF" />
          <ThemedText> Create Label</ThemedText>
        </TouchableOpacity>
      )}
      
      {/* Files Section */}
      <View style={styles.header}>
        <ThemedText style={styles.titleText}>My Files</ThemedText>
        <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
          <Ionicons name={isGridView ? 'grid-outline' : 'list-outline'} size={24} color="#000000" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredFiles}
        key={isGridView ? 'grid-files' : 'list-files'}
        numColumns={isGridView ? 2 : 1}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
      />
      
      {/* Labels Section */}
      <View style={[styles.header, styles.labelsHeader]}>
        <ThemedText style={styles.titleText}>Labels</ThemedText>
      </View>
      
      <FlatList
        data={filteredLabels}
        key={isGridView ? 'grid-labels' : 'list-labels'}
        numColumns={isGridView ? 2 : 1}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
      />
      
      <TagModal
        visible={modalVisible}
        TagName={newTagName}
        onChangeTagName={setNewTagName}
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmCreateTag}
      />
    </ThemedView>
  );
}

export default function AppNavigator() {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <SidebarContent {...props} />} 
      screenOptions={{
        drawerStyle: { backgroundColor: '#FFFFFF' },
        drawerLabelStyle: { color: '#000000' },
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: '#000000' },
        headerTintColor: '#000000', // Ensures top-left icon is black
      }}
    > 
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
}




const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F0F0', 
    padding: 10, 
    borderRadius: 10, 
    marginBottom: 12 
  },
  searchInput: { flex: 1, color: '#000000', marginLeft: 10 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  labelsHeader: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16
  },
  titleText: { 
    color: '#333333', // Darker gray for better contrast in light mode
    fontSize: 24, 
    fontWeight: 'bold' 
  },  
  tagButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#3A6FF7', 
    padding: 12, 
    borderRadius: 8, 
    justifyContent: 'center', 
    marginBottom: 12 
  },
  rowItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    backgroundColor: '#F8F8F8', 
    borderRadius: 10, 
    marginBottom: 8,
    borderWidth: 1, 
    borderColor: '#E0E0E0' 
  },
  gridItem: { 
    alignItems: 'center', 
    backgroundColor: '#F8F8F8', 
    borderRadius: 10, 
    padding: 16, 
    margin: 8, 
    flexBasis: '48%',
    borderWidth: 1, 
    borderColor: '#E0E0E0' 
  },
  fileIcon: { marginHorizontal: 10 },
  fileName: { flex: 1, color: '#000000' },
  timestamp: { color: '#606060', fontSize: 12 },
  menuIcon: { marginLeft: 10, color: '#000000' },
  thumbnail: { width: 60, height: 60, backgroundColor: '#D1D1F7', marginTop: 8 },
  sidebar: { flex: 1, backgroundColor: '#F8F8F8', padding: 20 },
  listContainer: { marginBottom: 8 },
});