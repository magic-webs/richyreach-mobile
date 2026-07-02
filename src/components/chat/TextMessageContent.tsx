import { StyleSheet, Text } from 'react-native';
import { Colors, FontFamily } from '@/constants/brand';

interface TextMessageContentProps {
  content: string;
  isMe: boolean;
}

export function TextMessageContent({ content, isMe }: TextMessageContentProps) {
  return <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{content}</Text>;
}

const styles = StyleSheet.create({
  bubbleText: { fontSize: 14.5, lineHeight: 20, color: Colors.ink, fontFamily: FontFamily.sansMedium },
  bubbleTextMe: { color: '#ffffff' },
});
