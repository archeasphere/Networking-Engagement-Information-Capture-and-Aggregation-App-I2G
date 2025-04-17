import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Modal, Image, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import TagModal from './TagModal';
import LoginScreen from './login';
import SidebarContent from './SidebarContent';
import UCHeader from '@/components/UCHeader'; // Adjust path based on file structure
import { setBackgroundColorAsync } from 'expo-system-ui';
import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { useState, useEffect, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '../../utils/api';

const Drawer = createDrawerNavigator();


const initialLabels = [
  { id: 'l1', name: 'Important', timestamp: new Date('2025-02-20T00:00:00Z').toUTCString(), icon: 'pricetag-outline', type: 'connection' },
  { id: 'l2', name: 'Work', timestamp: new Date('2025-02-17T00:00:00Z').toUTCString(), icon: 'pricetag-outline', type: 'connection' },
];

// Sample file content for preview
const sampleContent = {
   archive: "Archive contents: \n- index.html\n- styles.css\n- script.js\n- images/\n  - logo.png\n  - header.jpg\n- README.md",
   connection: "This is a connection preview.\n\nDetails:\n- Groups related files or content.\n- Created to organize your workspace.\n- Lists the files URL."
};

function HomeScreen({ }) {
  const [isGridView, setIsGridView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [labels, setLabels] = useState(initialLabels);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [showDropdownFor, setShowDropdownFor] = useState(null); // ID of the file for which dropdown is visible
  
  // New state for sorting
  const [sortField, setSortField] = useState('timestamp'); // Default sort by timestamp
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort direction descending (newest first)

  const filteredFiles = files.filter((file) => {
    const query = searchQuery.toLowerCase();
    return (
      file.name.toLowerCase().includes(query) ||
      file.timestamp.toLowerCase().includes(query) ||
      file.type.toLowerCase().includes(query) ||
      (file.url && file.url.toLowerCase().includes(query)) // Check if URL is present and includes the query
    
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

  // Combine filtered files and labels into a single array
  const combinedItems = [...filteredFiles, ...filteredLabels];
  
  // Sort combined items based on sortField and sortDirection
  const sortedItems = [...combinedItems].sort((a, b) => {
    if (sortField === 'name') {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    } else if (sortField === 'timestamp') {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortDirection === 'asc' 
        ? dateA - dateB 
        : dateB - dateA;
    }
    return 0;
  });

  // Function to handle sorting - toggle direction if same field, or set new field with desc direction
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setSortField(field);
      setSortDirection('desc'); // Default to descending (newest first or Z-A)
    }
  };

  // Helper function to determine icon based on content type
  const getIconForType = (contentType) => {
    // First normalize the content type to lowercase
    const type = contentType ? contentType.toLowerCase() : 'unknown';
    
    // Check for PDF files
    if (type === 'pdf' || type.includes('application/pdf')) {
      return 'document-text-outline';
    }
    
    // Check for image files
    if (type === 'image' || 
        type.includes('image/') ||
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].some(ext => type.includes(ext))) {
      return 'image-outline';
    }
    
    // Check for archive files
    if (type === 'archive' || 
        ['zip', 'rar', '7z', 'tar', 'gz', 'application/zip', 'application/x-rar'].some(ext => type.includes(ext))) {
      return 'file-tray-outline';
    }
    
    // Check for text files
    if (type === 'text' || 
        type.includes('text/') || 
        ['txt', 'rtf', 'doc', 'docx', 'application/msword', 'application/vnd.openxmlformats'].some(ext => type.includes(ext))) {
      return 'document-outline';
    }
    
    // Check for spreadsheet files
    if (['xls', 'xlsx', 'csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml'].some(ext => type.includes(ext))) {
      return 'grid-outline';
    }
    
    // Check for presentation files
    if (['ppt', 'pptx', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml'].some(ext => type.includes(ext))) {
      return 'easel-outline';
    }
    
    // Check for audio files
    if (type.includes('audio/') || ['mp3', 'wav', 'ogg', 'flac'].some(ext => type.includes(ext))) {
      return 'musical-note-outline';
    }
    
    // Check for video files
    if (type.includes('video/') || ['mp4', 'avi', 'mov', 'wmv', 'mkv'].some(ext => type.includes(ext))) {
      return 'videocam-outline';
    }
    
    // Default icon for unknown file types
    return 'document-outline';
  };

  const fetchFiles = async () => {
    try {
      console.log("📡 Fetching from backend...");
      const response = await fetch('https://backend-service-ndyt.onrender.com/api/files/all');

      const json = await response.json();
 
      if (!json.success || !json.data) {
        throw new Error("Invalid response format");
      }
 
      const formattedFiles = json.data.map((file) => ({
        id: file.id || Math.random().toString(36).substr(2, 9),
        name: file.file_name,
        timestamp: new Date(file.uploaded_at || Date.now()).toUTCString(),
        icon: getIconForType(file.file_type),
        type: 'file',
        contentType: file.file_type,
        url: file.file_url
      }));
 
      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
      Alert.alert('Error', 'Failed to load files from server');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const toggleSelection = (id, type) => {
    if (type === 'file') {
      setSelectedFiles((prev) =>
        prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
      );
    }
  };

  const confirmCreateConnection = async () => {
    if (selectedFiles.length > 0) {
      const connectionCount = labels.length + 1;
      const connectionName = newTagName.trim() || `Connection ${connectionCount}`;
  
      const associatedFiles = selectedFiles.map((id) => {
        const file = files.find((f) => f.id === id);
        return file ? { name: file.name, url: file.url } : { name: id, url: '' };
      });
  
      const fileContent = associatedFiles
        .map((file) => `Name: ${file.name}\nURL: ${file.url}\n`)
        .join('\n');
  
      console.log("📁 Connection file content:", fileContent);
  
      try {
        // Create a Blob for the .txt file
        const blob = new Blob([fileContent], { type: 'text/plain' });
  
        // Convert Blob to Base64
        const base64Content = await blobToBase64(blob);
  
        // Upload the file using the same logic as `uploadFile`
        const data = await uploadFile({
          uri: `data:text/plain;base64,${base64Content}`, // Base64-encoded string
          name: `${connectionName}.txt`,
          mimeType: 'text/plain',
        });
  
        const fileUrl = data.file_url || data.url;
        if (!fileUrl) {
          throw new Error('No file URL returned from the upload');
        }
  
        console.log('✅ Connection file uploaded to Cloudinary:', fileUrl);
  
        const newConnection = {
          id: 'l' + Date.now().toString(),
          name: connectionName,
          timestamp: new Date().toUTCString(),
          icon: 'pricetag-outline',
          type: 'connection',
          associatedFiles: associatedFiles.map((file) => file.name),
          connectionFileUrl: fileUrl,
        };
  
        console.log("✅ New connection created:", newConnection);
  
        setLabels((prevLabels) => [...prevLabels, newConnection]);
        setSelectedFiles([]);
        setModalVisible(false);
        setNewTagName('');
      } catch (error) {
        console.error('❌ Failed to upload connection file:', error);
        Alert.alert('Error', 'Failed to save connection file.');
      }
    } else {
      console.warn("🚫 No files selected for the connection.");
    }
  };

  // Handler for adding a new file
  const handleFileUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
  
    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      console.log("📁 Picker file:", file);
  
      try {
        const data = await uploadFile(file); // ✅ sends actual File to backend
        const fileUrl = data.file_url || data.url;
  
        if (fileUrl) {
          const isImage = file.type?.startsWith("image/");
          const newFile = {
            id: Date.now().toString(),
            name: file.name,
            timestamp: new Date().toUTCString(),
            icon: isImage ? null : 'document-outline',
            url: fileUrl,
            type: 'file',
            isImage,
          };
  
          console.log("✅ File uploaded & added to list:", newFile);
  
          // ✅ Inject into current state
          //setFiles((prev) => [newFile, ...prev]);
          await fetchFiles();
          // ✅ Optional: auto-close upload modal
          setUploadModalVisible(false);
        } else {
          console.warn("⚠️ Upload succeeded but no file URL returned:", data);
        }
      } catch (err) {
        console.error("❌ Upload failed:", err);
      }
    } else {
      console.warn("🚫 File picking was cancelled or invalid:", result);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extract Base64 string
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
      // Determine content type for preview
      const contentType = previewItem.contentType.toLowerCase();
      
      if (contentType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].some(ext => contentType.includes(ext))) {
        return (
          <View style={styles.previewContent}>
            <Image 
              source={{ uri:previewItem.url || sampleContent.image }} 
              style={styles.imagePreview} 
              resizeMode="contain"
            />
          </View>
        );
      } else if (contentType.includes('pdf')) {
        return (
          <View style={styles.previewContent}>
            <Ionicons name="document-text" size={64} color="#E74C3C" />
            <ThemedText style={styles.previewText}>{sampleContent.pdf}</ThemedText>
          </View>
        );
      } else if (contentType.includes('text') || ['txt', 'rtf', 'doc', 'docx'].some(ext => contentType.includes(ext))) {
        return (
          <View style={styles.previewContent}>
            <ThemedText style={styles.previewText}>{sampleContent.text}</ThemedText>
          </View>
        );
      } else if (['zip', 'rar', '7z', 'tar', 'gz'].some(ext => contentType.includes(ext))) {
        return (
          <View style={styles.previewContent}>
            <Ionicons name="file-tray" size={64} color="#F39C12" />
            <ThemedText style={styles.previewText}>{sampleContent.archive}</ThemedText>
          </View>
        );
      } else {
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
            {`Connection: ${previewItem.name}\nCreated: ${previewItem.timestamp}\n\nAssociated Files:`}
          </ThemedText>
          {previewItem.associatedFiles?.map((file, index) => (
            <View key={index} style={{ marginTop: 8 }}>
              <ThemedText style={styles.previewText}>
                {`Name: ${file.name}\nURL: ${file.url}`}
              </ThemedText>
            </View>
          ))}
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
    const fileIndex = combinedItems.findIndex(item => item.id === showDropdownFor);
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

  // Render the sorting header component
  const renderSortingHeader = () => {
    if (isGridView) return null; // Don't show sorting header in grid view
    
    return (
      <View style={styles.sortingHeader}>
        <View style={styles.sortingColumnHeader}>
          <TouchableOpacity 
            style={styles.sortingButton} 
            onPress={() => handleSort('name')}
          >
            <ThemedText style={styles.sortingHeaderText}>Name</ThemedText>
            {sortField === 'name' && (
              <Ionicons 
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#3A6FF7" 
              />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.timestampColumnHeader}>
          <TouchableOpacity 
            style={styles.sortingButton} 
            onPress={() => handleSort('timestamp')}
          >
            <ThemedText style={styles.sortingHeaderText}>Time</ThemedText>
            {sortField === 'timestamp' && (
              <Ionicons 
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#3A6FF7" 
              />
            )}
          </TouchableOpacity>
        </View>
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
        size={28} 
        color={item.type === 'connection' ? '#FF6B6B' : '#4C8CFF'} 
        style={styles.fileIcon} 
      />
      
      <TouchableOpacity
        style={styles.fileInfoContainer}
        onPress={() => handlePreview(item)}
      >
        <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.fileName}>
          {item.name}
        </ThemedText>
        {item.url && (
          <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.fileUrl}>
            {item.url}
          </ThemedText>
        )}
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
        <UCHeader />
        <View style={styles.headerSpacer} /> {/* This pushes your content below the fixed UCHeader */}

        {/* Now your search bar and "All Files" will show properly */}
        <View style={styles.header}>
          <ThemedText style={styles.titleText}>All Files</ThemedText>
          <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
            <Ionicons name={isGridView ? 'grid-outline' : 'list-outline'} size={24} color="#000000" />
          </TouchableOpacity>
        </View>

      {/* 🔻 Move Search Bar Here */}
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
        
        {/* Combined Files and Connections Section */}

        {/* <View style={styles.header}>
          <ThemedText style={styles.titleText}>All Files</ThemedText>
          <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
            <Ionicons name={isGridView ? 'grid-outline' : 'list-outline'} size={24} color="#000000" />
          </TouchableOpacity>
        </View> */}
        
        {/* New Sorting Header */}
        {renderSortingHeader()}

        {/* No items found message */}
        {searchQuery.trim() && sortedItems.length === 0 && (
          <ThemedText style={styles.noResultsText}>No items found</ThemedText>
        )}
        
        {/* Combined FlatList for files and connections */}
        <FlatList
          data={sortedItems}
          key={isGridView ? 'grid-items' : 'list-items'}
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
          <ThemedText style={styles.uploadText}>New</ThemedText>
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
                  onPress={handleFileUpload}
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

// 
export default function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SidebarContent {...props} />}
      screenOptions={{
        headerShown: false, // Disable the default header
        drawerStyle: { backgroundColor: '#FFFFFF' },
        drawerLabelStyle: { color: '#000000' },
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
    fontSize: 22,
    fontWeight: '600', // or 'bold' for a heavier look
    color: '#1A1A1A',   // or use '#000000' for true black
    letterSpacing: 0.5, // subtle spacing
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
  
  // New sorting header styles
  sortingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  sortingColumnHeader: {
    flex: 1,
    marginLeft: 70, // Align with file name
  },
  timestampColumnHeader: {
    width: 100,
    marginRight: 30, // Align with timestamp
  },
  sortingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortingHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginRight: 4,
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
    marginRight: 10,
    width: 100, // Fixed width for timestamp column
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

  fileUrl: {
    color: '#606060',
    fontSize: 12
  },

  uploadText: {
    color: '#FFFFFF',
    marginLeft: 1,
    fontWeight: '500',
    fontSize: 11,
  },
  
  headerSpacer: {
    height: 60, // Match the height of UCHeader from UCHeader.js
  },
  

});