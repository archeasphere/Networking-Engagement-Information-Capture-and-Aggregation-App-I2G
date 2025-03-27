import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Modal, Image, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import TagModal from './TagModal';
import LoginScreen from './login';
import SidebarContent from './SidebarContent';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';

const Drawer = createDrawerNavigator();

const initialFiles = [
  { id: '1', name: 'Project Docs.pdf', timestamp: new Date('2025-02-19T00:00:00Z').toUTCString(), icon: 'document-text-outline', type: 'file', contentType: 'pdf' },
  { id: '2', name: 'Design Mockups.png', timestamp: new Date('2025-02-18T00:00:00Z').toUTCString(), icon: 'image-outline', type: 'file', contentType: 'image' },
  { id: '3', name: 'App Code.zip', timestamp: new Date('2025-02-15T00:00:00Z').toUTCString(), icon: 'file-tray-outline', type: 'file', contentType: 'archive' },
  { id: '4', name: 'Meeting Notes.txt', timestamp: new Date('2025-02-10T00:00:00Z').toUTCString(), icon: 'document-outline', type: 'file', contentType: 'text' },
];

const initialLabels = [
  { id: 'l1', name: 'Important', timestamp: new Date('2025-02-20T00:00:00Z').toUTCString(), icon: 'pricetag-outline', type: 'connection' },
  { id: 'l2', name: 'Work', timestamp: new Date('2025-02-17T00:00:00Z').toUTCString(), icon: 'pricetag-outline', type: 'connection' },
];

// Sample file content for preview
const sampleContent = {
  text: "Meeting Notes\n\nDate: February 10, 2025\nAttendees: John, Sarah, Mike, Lisa\n\nAgenda:\n1. Project status update\n2. Budget review\n3. Timeline adjustment\n\nAction Items:\n- John to complete frontend by Feb 15\n- Sarah to finalize designs by Feb 12\n- Mike to update documentation\n- Lisa to coordinate with clients",
  pdf: "Document preview not available. This would display the PDF content in a real implementation.",
  image: "https://via.placeholder.com/800x600",
  archive: "Archive contents: \n- index.html\n- styles.css\n- script.js\n- images/\n  - logo.png\n  - header.jpg\n- README.md",
  connection: "This is a connection preview.\n\nDetails:\n- Groups related files or content.\n- Created to organize your workspace.\n- Lists the files URL."
};

function HomeScreen({ navigation }) {
  const [isGridView, setIsGridView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState(initialFiles);
  const [labels, setLabels] = useState(initialLabels);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [showDropdownFor, setShowDropdownFor] = useState(null); // ID of the file for which dropdown is visible

  const filteredFiles = files.filter((file) => {
    const query = searchQuery.toLowerCase();
    return (
      file.name.toLowerCase().includes(query) ||
      file.timestamp.toLowerCase().includes(query) ||
      file.type.toLowerCase().includes(query)

    );
  });
  
  const filteredLabels = labels.filter((label) => {
    const query = searchQuery.toLowerCase();
    return (
      label.name.toLowerCase().includes(query) ||
      label.timestamp.toLowerCase().includes(query) ||
      label.type.toLowerCase().includes(query)
    );
  });

  const toggleSelection = (id, type) => {
    if (type === 'file') {
      setSelectedFiles((prev) =>
        prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
      );
    }
  };

  const confirmCreateConnection = () => {
    if (selectedFiles.length > 0) {
      // Generate a default name if none provided (e.g., "Connection 1", "Connection 2")
      const connectionCount = labels.length + 1; // Number of existing connections + 1
      const connectionName = newTagName.trim() || `Connection ${connectionCount}`; // Use input or default
      const newConnection = {
        id: 'l' + Date.now().toString(),
        name: connectionName, // Use the determined name
        timestamp: new Date().toUTCString(),
        icon: 'pricetag-outline',
        type: 'connection'
      };
      setLabels((prevLabels) => [...prevLabels, newConnection]);
      setSelectedFiles([]);
      setModalVisible(false);
      setNewTagName('');
    }
  };

  // Handler for adding a new file
  const handleFileUpload = (fileName = "Uploaded File.pdf") => {
    // Determine the file icon and content type based on extension
    const extension = fileName.split('.').pop().toLowerCase();
    let icon = 'document-outline';
    let contentType = 'text';
    
    // Set icon and content type based on file extension
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      icon = 'image-outline';
      contentType = 'image';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      icon = 'file-tray-outline';
      contentType = 'archive';
    } else if (['pdf'].includes(extension)) {
      icon = 'document-text-outline';
      contentType = 'pdf';
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      icon = 'grid-outline';
      contentType = 'spreadsheet';
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      icon = 'document-outline';
      contentType = 'text';
    }
    
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      timestamp: new Date().toUTCString(),
      icon: icon,
      type: 'file',
      contentType: contentType
    };
    
    setFiles([...files, newFile]);
    setUploadModalVisible(false);
  };

  // Handler for opening the file options menu
  const handleOptionsMenu = (file) => {
    // Toggle dropdown visibility for this file
    setShowDropdownFor(showDropdownFor === file.id ? null : file.id);
  };

  // Handle file deletion
  const handleDeleteFile = (fileId) => {
    // Show confirmation alert before deletion
    Alert.alert(
      "Delete File",
      "Are you sure you want to delete this file?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            setFiles(files.filter(file => file.id !== fileId));
            setShowDropdownFor(null); // Hide dropdown after deletion
          },
          style: "destructive"
        }
      ]
    );
  };

  // Handle file sharing
  const handleShareFile = (file) => {
    Alert.alert(
      "Share File",
      `Sharing options for ${file.name} will appear here.`,
      [{ text: "OK" }]
    );
    setShowDropdownFor(null); // Hide dropdown after action
  };

  // Handle file permissions
  const handleFilePermissions = (file) => {
    Alert.alert(
      "File Permissions",
      `Permission settings for ${file.name} will appear here.`,
      [{ text: "OK" }]
    );
    setShowDropdownFor(null); // Hide dropdown after action
  };

  // Handler for previewing a file
  const handlePreview = (item) => {
    setPreviewItem(item);
    setPreviewModalVisible(true);
  };

  // Close dropdown when clicking elsewhere
  const handleOutsideClick = () => {
    if (showDropdownFor) {
      setShowDropdownFor(null);
    }
  };

  // Render the file preview content based on file type
  const renderPreviewContent = () => {
    if (!previewItem) return null;
    
    if(previewItem.type === 'file') {
    switch (previewItem.contentType) {
      case 'image':
        return (
          <View style={styles.previewContent}>
            <Image 
              source={{ uri: sampleContent.image }} 
              style={styles.imagePreview} 
              resizeMode="contain"
            />
          </View>
        );
      case 'pdf':
        return (
          <View style={styles.previewContent}>
            <Ionicons name="document-text" size={64} color="#E74C3C" />
            <ThemedText style={styles.previewText}>{sampleContent.pdf}</ThemedText>
          </View>
        );
      case 'text':
        return (
          <View style={styles.previewContent}>
            <ThemedText style={styles.previewText}>{sampleContent.text}</ThemedText>
          </View>
        );
      case 'archive':
        return (
          <View style={styles.previewContent}>
            <Ionicons name="file-tray" size={64} color="#F39C12" />
            <ThemedText style={styles.previewText}>{sampleContent.archive}</ThemedText>
          </View>
        );
      default:
        return (
          <View style={styles.previewContent}>
            <Ionicons name="document" size={64} color="#3498DB" />
            <ThemedText style={styles.previewText}>Preview not available for this file type</ThemedText>
          </View>
        );
    }
  } else if (previewItem.type === 'connection') {
      return (
        <View style={styles.previewContent}>
        <Ionicons name="pricetag-outline" size={64} color="#FF6B6B" />
        <ThemedText style={styles.previewText}>
          {`Connection: ${previewItem.name}\nCreated: ${previewItem.timestamp}\n\n${sampleContent.connection}`}
        </ThemedText>
      </View>      
      );
    }
  };

  // Render each dropdown menu separately at the root level
  const renderDropdownMenus = () => {
    if (!showDropdownFor) return null;
    
    const file = [...files, ...labels].find(item => item.id === showDropdownFor);
    if (!file || file.type !== 'file') return null;
    
    // Find the position of the file item in the list
    const fileIndex = filteredFiles.findIndex(item => item.id === showDropdownFor);
    if (fileIndex === -1) return null;
    
    // Calculate the position of the dropdown
    const itemHeight = isGridView ? 140 : 60; // Approximate height of items
    const dropdownTopPosition = 60 + (fileIndex * itemHeight);
    
    return (
      <View style={[styles.dropdownMenu, {
        position: 'absolute',
        top: Math.min(dropdownTopPosition, 300), // Limit how far down it can go
        right: 28,
        zIndex: 9999,
        elevation: 9999,
      }]}>
        <TouchableOpacity 
          style={styles.dropdownItem}
          onPress={() => handleShareFile(file)}
        >
          <Ionicons name="share-social-outline" size={16} color="#000000" />
          <ThemedText style={styles.dropdownItemText}>Share</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dropdownItem}
          onPress={() => handleFilePermissions(file)}
        >
          <Ionicons name="lock-closed-outline" size={16} color="#000000" />
          <ThemedText style={styles.dropdownItemText}>Permissions</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dropdownItem, styles.deleteItem]}
          onPress={() => handleDeleteFile(file.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          <ThemedText style={styles.deleteItemText}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={[isGridView ? styles.gridItem : styles.rowItem]}>
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={selectedFiles.includes(item.id)}
          onValueChange={() => toggleSelection(item.id, item.type)}
          color={selectedFiles.includes(item.id) ? '#5A42F5' : undefined}
          disabled={item.type !== 'file'}
        />
      </View>
      
      <Ionicons 
        name={item.icon} 
        // CHANGE 7: Updated color condition to use 'connection' instead of 'label'
        // WHY: Matches the type change in 'initialLabels' and 'confirmCreateConnection'
        size={28} 
        color={item.type === 'connection' ? '#FF6B6B' : '#4C8CFF'} 
        style={styles.fileIcon} 
      />
      
      <TouchableOpacity 
        style={styles.fileInfoContainer}
        // CHANGE 8: Simplified onPress to call 'handlePreview' for all items
        // WHY: Allows clicking any item (file or connection) to show a preview, removing the 'file'-only condition
        onPress={() => handlePreview(item)}
        // Removed 'disabled' prop to enable clicking for all items
      >
        <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.fileName}>
          {item.name}
        </ThemedText>
      </TouchableOpacity>
      
      {!isGridView && (
        <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
      )}
      
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuIconContainer}
          onPress={() => handleOptionsMenu(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#000000" />
        </TouchableOpacity>
      </View>
      
      {isGridView && (
        <View style={styles.gridBottomSection}>
          <View style={styles.thumbnail} />
          <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
        </View>
      )}
    </View>
  )

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      style={{flex: 1}} 
      onPress={handleOutsideClick}
    >
      <ThemedView style={styles.container}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#B0B0B0" />
          <TextInput
            placeholder="Search files and connections..."
            placeholderTextColor="#B0B0B0"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {selectedFiles.length > 0 && (
          <TouchableOpacity style={styles.tagButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="pricetag-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.tagButtonText}> Create Connection</ThemedText>
          </TouchableOpacity>
        )}
        
        {/* Files Section */}
        <View style={styles.header}>
          <ThemedText style={styles.titleText}>My Files</ThemedText>
          <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
            <Ionicons name={isGridView ? 'grid-outline' : 'list-outline'} size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Add "No files found" message here */}
        {searchQuery.trim() && filteredFiles.length === 0 && (
          <ThemedText style={styles.noResultsText}>No files found</ThemedText>
        )}

        
        <FlatList
          data={filteredFiles}
          key={isGridView ? 'grid-files' : 'list-files'}
          numColumns={isGridView ? 2 : 1}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
        />
        
        {/* Connections Section */}
        <View style={[styles.header, styles.labelsHeader]}>
          <ThemedText style={styles.titleText}>Connections</ThemedText>
        </View>
        
        <FlatList
          data={filteredLabels}
          key={isGridView ? 'grid-labels' : 'list-labels'}
          numColumns={isGridView ? 2 : 1}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
        />
        
        {/* Render dropdown menus at the root level to ensure they appear on top */}
        {renderDropdownMenus()}
        
        {/* Upload Button (FAB) */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setUploadModalVisible(true)}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Tag Modal */}
        <TagModal
          visible={modalVisible}
          TagName={newTagName}
          onChangeTagName={setNewTagName}
          onCancel={() => setModalVisible(false)}
          onConfirm={confirmCreateConnection}
        />
        
        {/* Upload Files Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={uploadModalVisible}
          onRequestClose={() => setUploadModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ThemedText style={styles.modalTitle}>Upload File</ThemedText>
              
              {/* Drag and drop area */}
              <View style={styles.uploadDropArea}>
                <Ionicons name="cloud-upload-outline" size={48} color="#B0B0B0" />
                <ThemedText style={styles.dropText}>Drop your file here</ThemedText>
                <TouchableOpacity 
                  style={styles.clickToUpload}
                  onPress={() => handleFileUpload("MyFile.pdf")}
                >
                  <ThemedText style={styles.clickToUploadText}>or click here to upload</ThemedText>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setUploadModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* File Preview Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={previewModalVisible}
          onRequestClose={() => setPreviewModalVisible(false)}
        >
          <BlurView intensity={60} style={styles.blurContainer}>
            <View style={styles.previewModalView}>
              <View style={styles.previewHeader}>
                <ThemedText style={styles.previewTitle}>
                  {previewItem?.name || "Preview"} 
                </ThemedText>
                <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
              {renderPreviewContent()}
            </View>
          </BlurView>
        </Modal>
        
        {/* Selection indicator */}
        {selectedFiles.length > 0 && (
          <View style={styles.selectionIndicator}>
            <ThemedText style={styles.selectionText}>
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
            </ThemedText>
            <TouchableOpacity onPress={() => setSelectedFiles([])}>
              <ThemedText style={styles.clearSelectionText}>Clear</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
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
        headerTintColor: '#000000',
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
    color: '#333333',
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
  tagButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
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
    width: '48%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center', 
    backgroundColor: '#F8F8F8', 
    borderRadius: 10, 
    padding: 16, 
    margin: 8, 
    borderWidth: 1, 
    borderColor: '#E0E0E0' 
  },
  checkboxContainer: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: { marginHorizontal: 10 },
  fileInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  fileName: { color: '#000000' },
  timestamp: { 
    color: '#606060', 
    fontSize: 12,
    marginRight: 10 
  },
  menuContainer: {
    position: 'relative',
  },
  menuIconContainer: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Dropdown menu styles - improved for better z-index handling
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 9999, // Highest elevation for Android
    width: 150,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
  },
  deleteItem: {
    borderBottomWidth: 0,
  },
  deleteItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF3B30',
  },
  
  gridBottomSection: {
    width: '100%',
    marginTop: 8,
  },
  thumbnail: { width: 60, height: 60, backgroundColor: '#D1D1F7', marginTop: 8 },
  sidebar: { flex: 1, backgroundColor: '#F8F8F8', padding: 20 },
  listContainer: { marginBottom: 8 },
  
  // Selection indicator
  selectionIndicator: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(58, 111, 247, 0.9)',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clearSelectionText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  
  // Upload button (FAB) styles
  uploadButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#3A6FF7',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#3A6FF7',
    fontWeight: '500',
  },
  
  // Drag and drop area styles
  uploadDropArea: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  dropText: {
    marginTop: 12,
    fontSize: 16,
    color: '#808080',
  },
  clickToUpload: {
    marginTop: 16,
  },
  clickToUploadText: {
    color: '#3A6FF7',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  
  // File preview modal styles
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)', // Additional tint for the blur effect
  },
  previewModalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  imagePreview: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  previewText: {
    marginTop: 16,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },

  noResultsText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#606060',
    fontSize: 16,
  },

});
