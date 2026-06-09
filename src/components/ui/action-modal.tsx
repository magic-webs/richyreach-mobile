import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export function ActionModal() {
  const { visible, title, message, actions, hideModal } = useUIStore();

  const handleAction = (onPress?: () => void) => {
    hideModal();
    if (onPress) {
      setTimeout(onPress, 100);
    }
  };

  const buttons = actions && actions.length > 0 ? actions : [{ text: 'OK', style: 'default' as const }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={hideModal}
    >
      <TouchableWithoutFeedback onPress={hideModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {!!title && <Text style={[styles.title, !message && { marginBottom: 24 }]}>{title}</Text>}
              {!!message && <Text style={[styles.message, !title && { marginTop: 24 }]}>{message}</Text>}

              <View style={[styles.buttonContainer, buttons.length > 2 ? { flexDirection: 'column' } : { flexDirection: 'row' }]}>
                {buttons.map((action, index) => {
                  const isDestructive = action.style === 'destructive';
                  const isCancel = action.style === 'cancel';
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        buttons.length <= 2 && index > 0 && styles.buttonBorderLeft,
                        buttons.length > 2 && index > 0 && styles.buttonBorderTop,
                        isCancel && styles.buttonCancel,
                      ]}
                      onPress={() => handleAction(action.onPress)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isDestructive && styles.textDestructive,
                          isCancel && styles.textCancel,
                        ]}
                      >
                        {action.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.cream,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadow.tab,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  message: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: 'rgba(63,3,11,0.6)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.06)',
  },
  buttonBorderTop: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  buttonCancel: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.oxblood,
  },
  textDestructive: {
    color: Colors.rose,
  },
  textCancel: {
    color: 'rgba(63,3,11,0.6)',
    fontWeight: '500',
  },
});
