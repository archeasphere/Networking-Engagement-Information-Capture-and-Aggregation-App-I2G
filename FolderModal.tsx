import { View, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface FolderModalProps {
  visible: boolean;
  folderName: string;
  onChangeFolderName: (text: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function FolderModal({ visible, folderName, onChangeFolderName, onCancel, onConfirm }: FolderModalProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Folder Name"
            placeholderTextColor="#aaa"
            style={styles.modalInput}
            value={folderName}
            onChangeText={onChangeFolderName}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onCancel} style={styles.modalButton}>
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.modalButton}>
              <ThemedText style={styles.buttonText}>Create</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalInput: {
    backgroundColor: '#333',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
