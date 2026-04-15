import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalBase, { ModalButton } from '../ModalBase';
import { Colors, Radius, Typography } from '../../../utils/theme';

const DIAS_SEMANA = [
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 },
];

// ─── Modal Criar Evento ──────────────────────────────────────────────────────
export function ModalCriarEvento({ show, onHide, novoEvento, setNovoEvento, onConfirmar, loading }) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Criar evento de estudo"
      iconType="info"
      icon={<Ionicons name="calendar-outline" />}
      footer={
        <>
          <ModalButton label="Cancelar" variant="secondary" onPress={onHide} disabled={loading} />
          <ModalButton
            label={loading ? '' : 'Criar eventos'}
            variant="primary"
            onPress={onConfirmar}
            disabled={loading}
            icon={loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="add" />}
          />
        </>
      }
    >
      {/* Nome do evento */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nome do evento</Text>
        <TextInput
          style={styles.input}
          value={novoEvento.titulo}
          onChangeText={(v) => setNovoEvento({ ...novoEvento, titulo: v })}
          placeholder="Ex: Matemática"
          placeholderTextColor={Colors.textPlaceholder}
        />
      </View>

      {/* Hora início / fim lado a lado */}
      <View style={styles.horasRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Hora início</Text>
          <TextInput
            style={styles.input}
            value={novoEvento.inicio}
            onChangeText={(v) => setNovoEvento({ ...novoEvento, inicio: v })}
            placeholder="HH:MM"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Hora fim</Text>
          <TextInput
            style={styles.input}
            value={novoEvento.fim}
            onChangeText={(v) => setNovoEvento({ ...novoEvento, fim: v })}
            placeholder="HH:MM"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
      </View>

      {/* Dias da semana */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Dias da semana</Text>
        <View style={styles.diasRow}>
          {DIAS_SEMANA.map((dia) => {
            const ativo = novoEvento.diasSemana.includes(dia.value);
            return (
              <TouchableOpacity
                key={dia.value}
                style={[styles.diaBtn, ativo && styles.diaBtnAtivo]}
                onPress={() => {
                  const selecionados = ativo
                    ? novoEvento.diasSemana.filter((d) => d !== dia.value)
                    : [...novoEvento.diasSemana, dia.value];
                  setNovoEvento({ ...novoEvento, diasSemana: selecionados });
                }}
              >
                <Text style={[styles.diaText, ativo && styles.diaTextAtivo]}>{dia.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ModalBase>
  );
}

// ─── Modal Reset Eventos ─────────────────────────────────────────────────────
export function ModalResetEventos({ show, onHide, onConfirmar, loading }) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Resetar eventos"
      iconType="danger"
      icon={<Ionicons name="refresh-outline" />}
      footer={
        <>
          <ModalButton label="Cancelar" variant="secondary" onPress={onHide} disabled={loading} />
          <ModalButton
            label={loading ? '' : 'Confirmar'}
            variant="danger"
            onPress={onConfirmar}
            disabled={loading}
            icon={loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="refresh-outline" />}
          />
        </>
      }
    >
      <Text style={styles.bodyText}>
        Tem certeza que deseja apagar todos os eventos de estudo do seu calendário?
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Essa ação não pode ser desfeita.</Text>
      </View>
    </ModalBase>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    width: '100%',
    gap: 5,
    marginBottom: 4,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: '#3a3a3a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  horasRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  diasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diaBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Radius.full,
    paddingHorizontal: 13,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  diaBtnAtivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  diaText: {
    fontSize: Typography.xs,
    color: '#444',
  },
  diaTextAtivo: {
    color: '#fff',
  },
  bodyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  badge: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.dangerDark,
  },
});
