import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow, Typography } from '../../utils/theme';

/**
 * Modal base — encapsula o Modal nativo do RN com o estilo do design system Learnly.
 * Props: show, onHide, title, icon, iconType ('info'|'danger'|'success'|'warning'), children, footer
 */
export default function ModalBase({ show, onHide, title, icon, iconType = 'info', children, footer }) {
  const iconColors = {
    info:    { bg: Colors.primaryLight,  color: Colors.primary,     ring: '#f5f9ff' },
    danger:  { bg: Colors.dangerLight,   color: Colors.danger,      ring: '#fff5f6' },
    success: { bg: Colors.successLight,  color: Colors.successDark, ring: '#f5fef7' },
    warning: { bg: Colors.warningLight,  color: Colors.warning,     ring: '#fffef5' },
  };
  const ic = iconColors[iconType];

  return (
    <Modal
      visible={show}
      transparent
      animationType="fade"
      onRequestClose={onHide}
      statusBarTranslucent
    >
      {/* Backdrop com blur simulado via opacidade */}
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <View style={styles.card}>
            {/* Botão fechar */}
            <TouchableOpacity style={styles.closeBtn} onPress={onHide} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Ícone */}
            {icon && (
              <View style={[styles.iconWrapper, { backgroundColor: ic.bg, shadowColor: ic.color }]}>
                <View style={[styles.iconRing, { borderColor: ic.ring }]}>
                  {React.cloneElement(icon, { color: ic.color, size: 28 })}
                </View>
              </View>
            )}

            {/* Título */}
            <Text style={styles.title}>{title}</Text>

            {/* Conteúdo */}
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {/* Footer */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Botões de ação do modal ─────────────────────────────────────────────────
export function ModalButton({ label, variant = 'primary', onPress, disabled, icon }) {
  const variantStyles = {
    primary: { bg: Colors.primary,      text: '#fff' },
    danger:  { bg: Colors.danger,       text: '#fff' },
    secondary: { bg: '#f1f5f9',         text: Colors.textPrimary, border: Colors.border },
  };
  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 1, borderColor: v.border },
        disabled && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {icon && React.cloneElement(icon, { size: 14, color: v.text, style: { marginRight: 4 } })}
      <Text style={[styles.btnText, { color: v.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,12,20,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  kav: {
    width: '100%',
    maxWidth: 480,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingTop: 28,
    overflow: 'hidden',
    ...Shadow.modal,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 4,
    paddingHorizontal: 40,
  },
  body: {
    width: '100%',
    maxHeight: 420,
  },
  bodyContent: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 12,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderTopWidth: 0,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    minWidth: 100,
    minHeight: 38,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
});
