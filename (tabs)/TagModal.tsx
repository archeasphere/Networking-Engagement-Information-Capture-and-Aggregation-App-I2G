import { View, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface TagModalProps {
  visible: boolean;
  TagName: string;
  onChangeTagName: (text: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function TagModal({ visible, TagName, onChangeTagName, onCancel, onConfirm }: TagModalProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Connection Name"
            placeholderTextColor="#aaa"
            style={styles.modalInput}
            value={TagName}
            onChangeText={onChangeTagName}
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
    backgroundColor: 'rgba(0,0,0,0.3)', // Lighter overlay for better visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF', // White background
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4,
    elevation: 5, // Shadow for Android
  },
  modalInput: {
    backgroundColor: '#F0F0F0', // Light gray input background
    color: '#000000', // Black text color
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0', // Subtle border
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
    color: '#000000', // Black text for contrast
    fontWeight: 'bold',
  },
});
