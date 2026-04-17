import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import LearnlyHeader from "../../components/LearnlyComponents/HeaderLearnly";
import PlanoAPI from "../../services/PlanoService";
import { Colors, Radius, Shadow, Typography } from "../../utils/theme";

import {
  ModalConfigurarPlano,
  ModalCriarPlano,
  ModalCriarPlanoIA,
  ModalExcluirPlano,
  ModalLancarHoras,
  ModalVisualizarPlano,
} from "../../components/Modais/Planos/ModaisPlanos";

const mapPlanoBackend = (plano) => ({
  planoId: plano.planoId,
  titulo: plano.titulo,
  objetivo: plano.objetivo,
  dataInicio: plano.dataInicio,
  dataFim: plano.dataFim,
  horasPorSemana: plano.horasPorSemana,
  ativo: plano.ativo,
  materias: (plano.planoMaterias ?? []).map((pm) => ({
    planoMateriaId: pm.planoMateriaId,
    materiaId: pm.materiaId,
    nome: pm.materia.nome,
    cor: pm.materia.cor,
    horasTotais: pm.horasTotais,
    horasConcluidas: pm.horasConcluidas,
    topicos: pm.topicos ?? [],
  })),
});

// ─── Tela principal ──────────────────────────────────────────────────────────

export default function Planos() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [modalCriar, setModalCriar] = useState(false);
  const [modalCriarIA, setModalCriarIA] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [modalConfigurar, setModalConfigurar] = useState(false);
  const [modalLancar, setModalLancar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);

  const { data: planosList = [] } = useQuery({
    queryKey: ["planos"],
    queryFn: async () => {
      const resposta = await PlanoAPI.Listar5();
      return resposta.map(mapPlanoBackend);
    },
    staleTime: Infinity,
  });

  const planoAtivoIndex = planosList.findIndex((p) => p.ativo);
  const planoAtivo = planosList[planoAtivoIndex >= 0 ? planoAtivoIndex : 0];

  function abrirVisualizar(plano) {
    setPlanoSelecionado(plano);
    setModalVisualizar(true);
  }

  function irParaConfigurar() {
    setModalVisualizar(false);
    setModalConfigurar(true);
  }

  function irParaLancar() {
    setModalVisualizar(false);
    setModalLancar(true);
  }

  function irParaExcluir() {
    setModalConfigurar(false);
    setModalExcluir(true);
  }

  async function handleCriarPlano(dados) {
    try {
      setLoading(true);
      await PlanoAPI.Criar(dados);
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      setModalCriar(false);
      Toast.show({ type: "success", text1: "Plano criado com sucesso!" });
    } catch {
      Toast.show({ type: "error", text1: "Erro ao criar plano" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCriarPlanoIA(dados) {
    try {
      setLoading(true);
      await PlanoAPI.CriarComIA(dados);
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      setModalCriarIA(false);
      Toast.show({ type: "success", text1: "Plano gerado pela IA!" });
    } catch {
      Toast.show({ type: "error", text1: "Erro ao gerar plano com IA" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarConfiguracoes(dados) {
    if (!planoSelecionado) return;
    try {
      setLoading(true);
      await PlanoAPI.Atualizar(planoSelecionado.planoId, dados);
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      setModalConfigurar(false);
      Toast.show({ type: "success", text1: "Plano atualizado!" });
    } catch {
      Toast.show({ type: "error", text1: "Erro ao salvar configurações" });
    } finally {
      setLoading(false);
    }
  }

  const LIMITE_DIARIO = 20;

  async function handleLancarHoras({ planoMateriaId, horas }) {
    if (!planoMateriaId || !horas || horas <= 0) {
      return Toast.show({
        type: "info",
        text1: "Selecione a matéria e informe um valor válido!",
      });
    }

    if (horas > 20) {
      return Toast.show({
        type: "info",
        text1: "O máximo de horas por lançamento é 20h",
      });
    }

    try {
      setLoading(true);

      const comparacao = await PlanoAPI.CompararHoras();
      const horasHoje = comparacao.horasHoje;
      const totalComNovoLancamento = horasHoje + Number(horas);

      if (totalComNovoLancamento > LIMITE_DIARIO) {
        setLoading(false);
        return Toast.show({
          type: "info",
          text1: `Limite diário de ${LIMITE_DIARIO}h atingido. Você já lançou ${horasHoje}h hoje.`,
        });
      }

      await PlanoAPI.LancarHoras(planoMateriaId, Number(horas));

      Toast.show({ type: "success", text1: `${horas}h lançadas com sucesso!` });

      setModalLancar(false);
      if (typeof setMostrarHoras === "function") setMostrarHoras(false);

      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["comparacaoHoras"] });
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      queryClient.invalidateQueries({ queryKey: ["planoAtivo"] });

      if (typeof invalidarPlanos === "function") invalidarPlanos();
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Erro ao lançar horas" });
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluirPlano() {
    if (!planoSelecionado) return;
    try {
      setLoading(true);
      await PlanoAPI.Excluir(planoSelecionado.planoId);
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      queryClient.invalidateQueries({ queryKey: ["planoAtivo"] });
      setModalExcluir(false);
      setPlanoSelecionado(null);
      Toast.show({ type: "success", text1: "Plano excluído!" });
    } catch {
      Toast.show({ type: "error", text1: "Erro ao excluir plano" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      <LearnlyHeader>
        <TouchableOpacity
          style={styles.botaoHeader}
          onPress={() => setModalCriar(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </LearnlyHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {planosList.length === 0 ? (
          <View style={styles.vazioContainer}>
            <Text style={styles.vazioText}>
              Nenhum plano ainda, que tal criar um?
            </Text>
          </View>
        ) : (
          <>
            {planoAtivo && (
              <>
                <Text style={styles.secaoTitulo}>Plano Atual</Text>
                <PlanoCard
                  plano={planoAtivo}
                  ativo
                  onVisualizar={() => abrirVisualizar(planoAtivo)}
                />
              </>
            )}

            {planosList.filter((_, i) => i !== planoAtivoIndex).length > 0 && (
              <>
                <Text style={styles.secaoTitulo}>Planos Inativos</Text>
                {planosList.map((plano, idx) =>
                  idx === planoAtivoIndex ? null : (
                    <PlanoCard
                      key={plano.planoId}
                      plano={plano}
                      ativo={false}
                      onVisualizar={() => abrirVisualizar(plano)}
                    />
                  ),
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB — Criar plano com IA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalCriarIA(true)}
      >
        <Ionicons name="hardware-chip-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* ── Modais ── */}
      <ModalCriarPlano
        show={modalCriar}
        onHide={() => setModalCriar(false)}
        loading={loading}
        onConfirmar={handleCriarPlano}
      />

      <ModalCriarPlanoIA
        show={modalCriarIA}
        onHide={() => setModalCriarIA(false)}
        loading={loading}
        onConfirmar={handleCriarPlanoIA}
      />

      <ModalVisualizarPlano
        show={modalVisualizar}
        onHide={() => setModalVisualizar(false)}
        plano={planoSelecionado}
        onLancarHoras={irParaLancar}
        onConfigurar={irParaConfigurar}
      />

      <ModalConfigurarPlano
        show={modalConfigurar}
        onHide={() => setModalConfigurar(false)}
        loading={loading}
        plano={planoSelecionado}
        onSalvar={handleSalvarConfiguracoes}
        onExcluir={irParaExcluir}
      />

      <ModalLancarHoras
        show={modalLancar}
        onHide={() => setModalLancar(false)}
        loading={loading}
        plano={planoSelecionado}
        onConfirmar={handleLancarHoras}
      />

      <ModalExcluirPlano
        show={modalExcluir}
        onHide={() => setModalExcluir(false)}
        loading={loading}
        plano={planoSelecionado}
        onConfirmar={handleExcluirPlano}
      />
    </View>
  );
}

function PlanoCard({ plano, ativo, onVisualizar }) {
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
    <View style={[styles.planoCard, ativo && styles.planoCardAtivo]}>
      <Text style={styles.planoTitulo}>{plano.titulo}</Text>

      <Text style={styles.progressoLabel}>Progresso Geral</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progresso}%` }]} />
      </View>
      <Text style={styles.progressoPercent}>{progresso.toFixed(1)}%</Text>

      {ativo && (
        <View style={styles.materiasRow}>
          {plano.materias.map((m, i) => (
            <View key={i} style={styles.materiaChip}>
              <View
                style={[
                  styles.materiaDot,
                  { backgroundColor: m.cor || Colors.primary },
                ]}
              />
              <Text style={styles.materiaNome}>{m.nome}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.botaoVisualizar} onPress={onVisualizar}>
        <Text style={styles.botaoVisualizarText}>▶ Visualizar Plano</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 80, gap: 14 },
  botaoHeader: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.sm,
    padding: 8,
  },
  vazioContainer: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  vazioText: {
    fontSize: Typography.xl,
    color: "#374151",
    textAlign: "center",
    fontWeight: "300",
  },
  secaoTitulo: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 8,
  },
  planoCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 20,
    gap: 8,
    ...Shadow.card,
  },
  planoCardAtivo: { borderColor: Colors.primaryBorder },
  planoTitulo: {
    fontSize: Typography.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  progressoLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.textMuted,
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
  progressoPercent: {
    fontSize: Typography.xs,
    fontWeight: "600",
    color: Colors.primary,
  },
  materiasRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  materiaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  materiaDot: { width: 7, height: 7, borderRadius: 999 },
  materiaNome: { fontSize: Typography.xs, fontWeight: "500", color: "#475569" },
  botaoVisualizar: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  botaoVisualizarText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: Typography.sm,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6c5ce7",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#6c5ce7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
});
