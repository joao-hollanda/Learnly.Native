import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Radius, Typography } from "../../../utils/theme";
import ModalBase, { ModalButton } from "../ModalBase";

const MATERIAS_DISPONIVEIS = [
  { label: "Matemática", value: 1, cor: "#3b82f6" },
  { label: "Língua Portuguesa", value: 2, cor: "#8b5cf6" },
  { label: "Redação", value: 3, cor: "#ec4899" },
  { label: "História", value: 4, cor: "#f59e0b" },
  { label: "Geografia", value: 5, cor: "#10b981" },
  { label: "Ciências da Natureza", value: 6, cor: "#06b6d4" },
  { label: "Física", value: 7, cor: "#6366f1" },
  { label: "Química", value: 8, cor: "#f97316" },
  { label: "Biologia", value: 9, cor: "#22c55e" },
  { label: "Filosofia", value: 10, cor: "#a855f7" },
  { label: "Sociologia", value: 11, cor: "#14b8a6" },
  { label: "Linguagens", value: 12, cor: "#ef4444" },
];

function LabelInput({ label }) {
  return <Text style={styles.label}>{label}</Text>;
}

function InputField({ label, ...props }) {
  return (
    <View style={styles.formGroup}>
      {label && <LabelInput label={label} />}
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.textPlaceholder}
        {...props}
      />
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function ModalCriarPlano({ show, onHide, loading, onConfirmar }) {
  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horasSemana, setHorasSemana] = useState("");
  const [materiasSel, setMateriasSel] = useState([]);

  function toggleMateria(id) {
    setMateriasSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleConfirmar() {
    onConfirmar({
      titulo,
      objetivo,
      dataInicio,
      dataFim,
      horasPorSemana: Number(horasSemana),
      materiasIds: materiasSel,
    });
  }

  function handleHide() {
    setTitulo("");
    setObjetivo("");
    setDataInicio("");
    setDataFim("");
    setHorasSemana("");
    setMateriasSel([]);
    onHide();
  }

  return (
    <ModalBase
      show={show}
      onHide={handleHide}
      title="Criar plano de estudos"
      iconType="info"
      icon={<Ionicons name="document-text-outline" />}
      footer={
        <>
          <ModalButton
            label="Cancelar"
            variant="secondary"
            onPress={handleHide}
            disabled={loading}
          />
          <ModalButton
            label={loading ? "" : "Criar plano"}
            variant="primary"
            onPress={handleConfirmar}
            disabled={loading}
            icon={
              loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="add" />
              )
            }
          />
        </>
      }
    >
      <InputField
        label="Título do plano"
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Ex: Plano ENEM 2025"
      />
      <InputField
        label="Objetivo"
        value={objetivo}
        onChangeText={setObjetivo}
        placeholder="Ex: Passar em medicina na UNIFESP"
        multiline
        numberOfLines={2}
        style={[styles.input, { height: 64, textAlignVertical: "top" }]}
      />

      <View style={styles.horasRow}>
        <View style={{ flex: 1 }}>
          <InputField
            label="Data início"
            value={dataInicio}
            onChangeText={setDataInicio}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </View>
        <View style={{ flex: 1 }}>
          <InputField
            label="Data fim"
            value={dataFim}
            onChangeText={setDataFim}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </View>
      </View>

      <InputField
        label="Horas de estudo por semana"
        value={horasSemana}
        onChangeText={setHorasSemana}
        placeholder="Ex: 20"
        keyboardType="number-pad"
        maxLength={3}
      />

      <SectionTitle>Matérias</SectionTitle>
      <View style={styles.materiasGrid}>
        {MATERIAS_DISPONIVEIS.map((m) => {
          const ativo = materiasSel.includes(m.value);
          return (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.materiaChip,
                ativo && { backgroundColor: m.cor, borderColor: m.cor },
              ]}
              onPress={() => toggleMateria(m.value)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.materiaDot,
                  { backgroundColor: ativo ? "#fff" : m.cor },
                ]}
              />
              <Text
                style={[styles.materiaChipText, ativo && { color: "#fff" }]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ModalBase>
  );
}

export function ModalCriarPlanoIA({ show, onHide, loading, onConfirmar }) {
  const [objetivo, setObjetivo] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horasSemana, setHorasSemana] = useState("");
  const [pontosFracos, setPontosFracos] = useState("");

  function handleConfirmar() {
    onConfirmar({
      objetivo,
      dataFim,
      horasPorSemana: Number(horasSemana),
      pontosFracos,
    });
  }

  function handleHide() {
    setObjetivo("");
    setDataFim("");
    setHorasSemana("");
    setPontosFracos("");
    onHide();
  }

  return (
    <ModalBase
      show={show}
      onHide={handleHide}
      title="Gerar plano com IA"
      iconType="info"
      icon={<Ionicons name="hardware-chip-outline" />}
      footer={
        <>
          <ModalButton
            label="Cancelar"
            variant="secondary"
            onPress={handleHide}
            disabled={loading}
          />
          <ModalButton
            label={loading ? "" : "Gerar plano"}
            variant="primary"
            onPress={handleConfirmar}
            disabled={loading}
            icon={
              loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="sparkles-outline" />
              )
            }
          />
        </>
      }
    >
      {/* Info chip */}
      <View style={styles.infoChip}>
        <Ionicons name="sparkles-outline" size={13} color={Colors.primary} />
        <Text style={styles.infoChipText}>
          A IA vai gerar um plano personalizado baseado nas suas informações
        </Text>
      </View>

      <InputField
        label="Seu objetivo"
        value={objetivo}
        onChangeText={setObjetivo}
        placeholder="Ex: Passar em Engenharia na USP"
        multiline
        numberOfLines={2}
        style={[styles.input, { height: 64, textAlignVertical: "top" }]}
      />

      <InputField
        label="Data do ENEM / prova alvo"
        value={dataFim}
        onChangeText={setDataFim}
        placeholder="DD/MM/AAAA"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      <InputField
        label="Horas disponíveis por semana"
        value={horasSemana}
        onChangeText={setHorasSemana}
        placeholder="Ex: 15"
        keyboardType="number-pad"
        maxLength={3}
      />

      <InputField
        label="Pontos fracos (opcional)"
        value={pontosFracos}
        onChangeText={setPontosFracos}
        placeholder="Ex: Trigonometria, Redação, Química Orgânica"
        multiline
        numberOfLines={2}
        style={[styles.input, { height: 64, textAlignVertical: "top" }]}
      />
    </ModalBase>
  );
}

// ─── 3. Modal Configurar Plano ───────────────────────────────────────────────

export function ModalConfigurarPlano({
  show,
  onHide,
  loading,
  plano,
  onSalvar,
  onExcluir,
}) {
  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horasSemana, setHorasSemana] = useState("");

  useEffect(() => {
    if (plano) {
      setTitulo(plano.titulo ?? "");
      setObjetivo(plano.objetivo ?? "");
      setDataFim(
        plano.dataFim
          ? plano.dataFim.slice(0, 10).split("-").reverse().join("/")
          : "",
      );
      setHorasSemana(String(plano.horasPorSemana ?? ""));
    }
  }, [plano]);

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Configurar plano"
      iconType="info"
      icon={<Ionicons name="settings-outline" />}
      footer={
        <>
          <ModalButton
            label="Excluir"
            variant="danger"
            onPress={onExcluir}
            disabled={loading}
            icon={<Ionicons name="trash-outline" />}
          />
          <ModalButton
            label={loading ? "" : "Salvar"}
            variant="primary"
            onPress={() =>
              onSalvar({
                titulo,
                objetivo,
                dataFim,
                horasPorSemana: Number(horasSemana),
              })
            }
            disabled={loading}
            icon={
              loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="checkmark" />
              )
            }
          />
        </>
      }
    >
      <InputField
        label="Título"
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título do plano"
      />
      <InputField
        label="Objetivo"
        value={objetivo}
        onChangeText={setObjetivo}
        placeholder="Seu objetivo"
        multiline
        numberOfLines={2}
        style={[styles.input, { height: 64, textAlignVertical: "top" }]}
      />
      <View style={styles.horasRow}>
        <View style={{ flex: 1 }}>
          <InputField
            label="Data fim"
            value={dataFim}
            onChangeText={setDataFim}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </View>
        <View style={{ flex: 1 }}>
          <InputField
            label="Horas/semana"
            value={horasSemana}
            onChangeText={setHorasSemana}
            placeholder="Ex: 20"
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>
      </View>
    </ModalBase>
  );
}

// ─── 4. Modal Visualizar Plano ───────────────────────────────────────────────

export function ModalVisualizarPlano({
  show,
  onHide,
  plano,
  onLancarHoras,
  onConfigurar,
}) {
  if (!plano) return null;

  const horasTotais = (plano.materias || []).reduce(
    (a, m) => a + m.horasTotais,
    0,
  );
  const horasConcluidas = (plano.materias || []).reduce(
    (a, m) => a + m.horasConcluidas,
    0,
  );
  const progresso = horasTotais > 0 ? (horasConcluidas / horasTotais) * 100 : 0;

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title={plano.titulo}
      iconType="info"
      icon={<Ionicons name="document-text-outline" />}
      footer={
        <>
          <ModalButton
            label="Configurar"
            variant="secondary"
            onPress={onConfigurar}
            icon={<Ionicons name="settings-outline" />}
          />
          <ModalButton
            label="Lançar horas"
            variant="primary"
            onPress={onLancarHoras}
            icon={<Ionicons name="time-outline" />}
          />
        </>
      }
    >
      {/* Objetivo */}
      {plano.objetivo ? (
        <View style={styles.objetivoBox}>
          <Text style={styles.objetivoText}>{plano.objetivo}</Text>
        </View>
      ) : null}

      {/* Barra de progresso geral */}
      <View style={styles.progressoContainer}>
        <View style={styles.progressoHeader}>
          <Text style={styles.progressoLabel}>Progresso geral</Text>
          <Text style={styles.progressoPct}>{progresso.toFixed(1)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progresso}%` }]} />
        </View>
        <Text style={styles.progressoHoras}>
          {horasConcluidas}h de {horasTotais}h concluídas
        </Text>
      </View>

      {/* Matérias */}
      <SectionTitle>Matérias</SectionTitle>
      {(plano.materias || []).map((m, i) => {
        const pct =
          m.horasTotais > 0 ? (m.horasConcluidas / m.horasTotais) * 100 : 0;
        return (
          <View key={i} style={styles.materiaRow}>
            <View style={styles.materiaRowHeader}>
              <View style={styles.materiaRowLeft}>
                <View
                  style={[
                    styles.materiaDotBig,
                    { backgroundColor: m.cor || Colors.primary },
                  ]}
                />
                <Text style={styles.materiaNome}>{m.nome}</Text>
              </View>
              <Text style={styles.materiaHoras}>
                {m.horasConcluidas}h / {m.horasTotais}h
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${pct}%`,
                    backgroundColor: m.cor || Colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </ModalBase>
  );
}

// ─── 5. Modal Lançar Horas ───────────────────────────────────────────────────

export function ModalLancarHoras({
  show,
  onHide,
  loading,
  plano,
  onConfirmar,
}) {
  const [materiaId, setMateriaId] = useState(null);
  const [horas, setHoras] = useState("");

  useEffect(() => {
    if (!show) {
      setMateriaId(null);
      setHoras("");
    }
  }, [show]);

  if (!plano) return null;

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Lançar horas estudadas"
      iconType="success"
      icon={<Ionicons name="time-outline" />}
      footer={
        <>
          <ModalButton
            label="Cancelar"
            variant="secondary"
            onPress={onHide}
            disabled={loading}
          />
          <ModalButton
            label={loading ? "" : "Lançar"}
            variant="primary"
            onPress={() => onConfirmar({ materiaId, horas: Number(horas) })}
            disabled={loading || !materiaId || !horas}
            icon={
              loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="checkmark" />
              )
            }
          />
        </>
      }
    >
      <SectionTitle>Selecione a matéria</SectionTitle>
      {(plano.materias || []).map((m, i) => {
        const ativo = materiaId === m.materiaId;
        return (
          <TouchableOpacity
            key={i}
            style={[styles.materiaSelRow, ativo && styles.materiaSelRowAtiva]}
            onPress={() => setMateriaId(m.materiaId)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.materiaDotBig,
                { backgroundColor: m.cor || Colors.primary },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.materiaNome}>{m.nome}</Text>
              <Text style={styles.materiaHoras}>
                {m.horasConcluidas}h / {m.horasTotais}h
              </Text>
            </View>
            <View
              style={[styles.radioCircle, ativo && styles.radioCircleAtivo]}
            >
              {ativo && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={[styles.formGroup, { marginTop: 8 }]}>
        <LabelInput label="Quantas horas estudou?" />
        <TextInput
          style={styles.input}
          value={horas}
          onChangeText={(v) => {
            if (v === "") return setHoras("");
            const n = parseFloat(v);
            if (!isNaN(n) && n >= 0.5 && n <= 24) setHoras(v);
            else if (v.length === 1) setHoras(v);
          }}
          placeholder="Ex: 2.5"
          keyboardType="decimal-pad"
          maxLength={4}
          placeholderTextColor={Colors.textPlaceholder}
        />
      </View>
    </ModalBase>
  );
}

// ─── 6. Modal Excluir Plano ──────────────────────────────────────────────────

export function ModalExcluirPlano({
  show,
  onHide,
  loading,
  plano,
  onConfirmar,
}) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Excluir plano"
      iconType="danger"
      icon={<Ionicons name="trash-outline" />}
      footer={
        <>
          <ModalButton
            label="Cancelar"
            variant="secondary"
            onPress={onHide}
            disabled={loading}
          />
          <ModalButton
            label={loading ? "" : "Excluir"}
            variant="danger"
            onPress={onConfirmar}
            disabled={loading}
            icon={
              loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="trash-outline" />
              )
            }
          />
        </>
      }
    >
      <Text style={styles.bodyText}>
        Tem certeza que deseja excluir o plano{" "}
        <Text style={{ fontWeight: "700", color: Colors.textPrimary }}>
          "{plano?.titulo}"
        </Text>
        ? Todo o progresso será perdido.
      </Text>
      <View style={styles.dangerBadge}>
        <Text style={styles.dangerBadgeText}>
          Essa ação não pode ser desfeita.
        </Text>
      </View>
    </ModalBase>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  formGroup: {
    width: "100%",
    gap: 5,
    marginBottom: 4,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: "600",
    color: "#3a3a3a",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  horasRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: Colors.textMuted,
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 6,
  },

  // Chips de matéria (seleção)
  materiasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  materiaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  materiaDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  materiaChipText: {
    fontSize: Typography.xs,
    fontWeight: "500",
    color: Colors.textSecondary,
  },

  // Info chip IA
  infoChip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.md,
    padding: 12,
    width: "100%",
    marginBottom: 4,
  },
  infoChipText: {
    flex: 1,
    fontSize: Typography.xs,
    color: Colors.primary,
    lineHeight: 18,
  },

  // Visualizar — progresso
  objetivoBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 12,
    width: "100%",
  },
  objetivoText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: "italic",
  },
  progressoContainer: {
    width: "100%",
    gap: 5,
    marginVertical: 4,
  },
  progressoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressoLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.textMuted,
  },
  progressoPct: {
    fontSize: Typography.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  progressoHoras: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // Matéria rows (visualizar)
  materiaRow: {
    width: "100%",
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  materiaRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  materiaRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  materiaDotBig: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  materiaNome: {
    fontSize: Typography.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  materiaHoras: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },

  // Matéria rows (lançar horas)
  materiaSelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    marginBottom: 6,
  },
  materiaSelRowAtiva: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryLight,
  },

  // Radio
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  radioCircleAtivo: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  // Textos modais danger/info
  bodyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  dangerBadge: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  dangerBadgeText: {
    fontSize: Typography.xs,
    fontWeight: "600",
    color: Colors.dangerDark,
  },
});
