import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow, Typography } from '../../utils/theme';

export default function Card({ titulo, subtitulo, icon, detalhe, style, children }) {
  return (
    <View style={[styles.card, style]}>
      {(titulo || detalhe) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon && <View style={styles.iconSlot}>{icon}</View>}
            <View>
              {titulo && <Text style={styles.titulo}>{titulo}</Text>}
              {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
            </View>
          </View>
          {detalhe && <View>{detalhe}</View>}
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconSlot: {
    opacity: 0.6,
  },
  titulo: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitulo: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  body: {
    padding: 16,
  },
});