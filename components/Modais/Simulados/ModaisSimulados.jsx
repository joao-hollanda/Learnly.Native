import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import ModalBase, { ModalButton } from '../ModalBase';
import { Colors, Radius, Typography } from '../../../utils/theme';

const MATERIAS = [
  { label: 'Linguagens', value: 'linguagens' },
  { label: 'Matemática', value: 'matematica' },
  { label: 'Ciências da Natureza', value: 'ciencias-natureza' },
  { label: 'Ciências Humanas', value: 'ciencias-humanas' },
];

// ─── Modal Criar Simulado ─────────────────────────────────────────────────────
export function ModalCriarSimulado({
  show, onHide, loading,
  quantidade, setQuantidade,
  materiasSelecionadas, toggleMateria,
  onGerar,
}) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Novo simulado"
      iconType="info"
      icon={<Ionicons name="clipboard-outline" />}
      footer={
        <>
          <ModalButton label="Cancelar" variant="secondary" onPress={onHide} disabled={loading} />
          <ModalButton
            label={loading ? '' : 'Criar'}
            variant="primary"
            onPress={onGerar}
            disabled={loading}
            icon={loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="clipboard-outline" />}
          />
        </>
      }
    >
      <Text style={styles.fieldLabel}>Matérias</Text>
      {MATERIAS.map((m) => {
        const selecionada = materiasSelecionadas.includes(m.value);
        return (
          <TouchableOpacity
            key={m.value}
            style={styles.checkRow}
            onPress={() => toggleMateria(m.value)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, selecionada && styles.checkboxAtivo]}>
              {selecionada && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkLabel}>{m.label}</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Quantidade de questões</Text>
      <TextInput
        style={styles.input}
        value={String(quantidade)}
        onChangeText={(v) => {
          if (v === '') return setQuantidade('');
          const n = parseInt(v, 10);
          if (n >= 1 && n <= 25) setQuantidade(n);
        }}
        placeholder="Máx: 25"
        placeholderTextColor={Colors.textPlaceholder}
        keyboardType="number-pad"
        maxLength={2}
      />
    </ModalBase>
  );
}

// ─── Modal Resultado ──────────────────────────────────────────────────────────
export function ModalResultado({ resultado, onFinalizar }) {
  return (
    <ModalBase
      show={!!resultado}
      onHide={() => {}}
      title="Resultado"
      iconType="success"
      icon={<Ionicons name="trophy" />}
      footer={
        <ModalButton
          label="Concluir"
          variant="primary"
          onPress={onFinalizar}
          icon={<Ionicons name="checkmark" />}
        />
      }
    >
      {resultado && (
        <>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, styles.badgeInfo]}>
              <Text style={[styles.badgeText, { color: Colors.primary }]}>
                Nota: {resultado.nota.toFixed(1)}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeSuccess]}>
              <Text style={[styles.badgeText, { color: Colors.successDark }]}>
                Acertos: {resultado.desempenho.quantidadeDeAcertos}
              </Text>
            </View>
          </View>
          <Markdown style={markdownStyles}>{resultado.desempenho.feedback}</Markdown>
        </>
      )}
    </ModalBase>
  );
}

// ─── Modal Preview Simulado (histórico) ──────────────────────────────────────
export function ModalPreviewSimulado({ simuladoPreview, previewRespostas, onHide }) {
  if (!simuladoPreview) return null;

  return (
    <ModalBase
      show={!!simuladoPreview}
      onHide={onHide}
      title={`Simulado de ${new Date(simuladoPreview.data).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })}`}
      iconType="info"
      icon={<Ionicons name="clipboard-outline" />}
    >
      {simuladoPreview.questoes.map((q, i) => {
        return (
          <View key={q.questaoId} style={styles.questaoCard}>
            <Text style={styles.questaoTitulo}>
              {i + 1}. {q.titulo}
            </Text>

            {q.contexto ? (
              <Markdown style={markdownStyles}>{q.contexto}</Markdown>
            ) : null}

            {q.alternativas.map((a) => {
              const marcada = previewRespostas[q.questaoId] === a.alternativaId;
              const correta = a.correta;
              let bgColor = 'transparent';
              if (correta) bgColor = Colors.successLight;
              if (marcada && !correta) bgColor = Colors.dangerLight;

              return (
                <View
                  key={a.alternativaId}
                  style={[
                    styles.alternativaRow,
                    { backgroundColor: bgColor },
                    correta && { borderLeftColor: Colors.success, borderLeftWidth: 3 },
                    marcada && !correta && { borderLeftColor: Colors.danger, borderLeftWidth: 3 },
                  ]}
                >
                  <View style={[styles.radioCircle, marcada && styles.radioCircleMarcado]}>
                    {marcada && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.alternativaLetra}>{a.letra})</Text>
                  <Text style={styles.alternativaTexto} numberOfLines={0}>
                    {a.texto || '(alternativa sem conteúdo)'}
                  </Text>
                </View>
              );
            })}

            {/* Explicação da IA */}
            {simuladoPreview.respostas?.find((r) => r.questaoId === q.questaoId)?.explicacao && (
              <View style={styles.explicacaoBox}>
                <Text style={styles.explicacaoTitulo}>Explicação:</Text>
                <Markdown style={markdownStyles}>
                  {simuladoPreview.respostas.find((r) => r.questaoId === q.questaoId).explicacao}
                </Markdown>
              </View>
            )}
          </View>
        );
      })}
    </ModalBase>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxAtivo: {
    backgroundColor: '#000',
  },
  checkLabel: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },

  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeInfo: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  badgeSuccess: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.successBorder,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
  },

  questaoCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  questaoTitulo: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  alternativaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  radioCircle: {
    width: 17,
    height: 17,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  radioCircleMarcado: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  alternativaLetra: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  alternativaTexto: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  explicacaoBox: {
    marginTop: 4,
    padding: 12,
    backgroundColor: 'rgba(99,102,241,0.06)',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    borderRadius: 8,
    gap: 4,
  },
  explicacaoTitulo: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6366f1',
  },
});

const markdownStyles = {
  body: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  paragraph: {
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 5,
    color: Colors.primary,
    fontSize: Typography.xs,
  },
};
