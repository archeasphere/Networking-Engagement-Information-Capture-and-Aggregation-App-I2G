import { View, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface NotesModalProps {
  visible: boolean;
  note: string;
  onChangeNote: (text: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function NotesModal({ visible, note, onChangeNote, onCancel, onConfirm }: NotesModalProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Enter note..."
            placeholderTextColor="#aaa"
            style={styles.modalInput}
            value={note}
            onChangeText={onChangeNote}
            multiline
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onCancel} style={styles.modalButton}>
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.modalButton}>
              <ThemedText style={styles.buttonText}>Save</ThemedText>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalInput: {
    backgroundColor: '#F0F0F0',
    color: '#000000',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    minHeight: 80, // to better support multi-line notes
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    textAlignVertical: 'top', // for multiline top alignment
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
    color: '#000000',
    fontWeight: 'bold',
  },
});
