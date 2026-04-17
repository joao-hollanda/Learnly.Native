import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Toast from "react-native-toast-message";

import LearnlyHeader from "../../components/LearnlyComponents/HeaderLearnly";
import {
  ModalCriarSimulado,
  ModalPreviewSimulado,
  ModalResultado,
} from "../../components/Modais/Simulados/ModaisSimulados";

import SimuladoAPI from "../../services/SimuladoService";
import { Colors, Radius, Shadow, Typography } from "../../utils/theme";

const getImagemAlternativa = (a) => a.arquivo || null;

export default function Simulados() {
  const queryClient = useQueryClient();

  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [quantidade, setQuantidade] = useState("");
  const [materiasSelecionadas, setMateriasSelecionadas] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulado, setSimulado] = useState(null);
  const [simuladoPreview, setSimuladoPreview] = useState(null);
  const [previewRespostas, setPreviewRespostas] = useState({});

  // ── Query: histórico ──
  const { data: simulados = [] } = useQuery({
    queryKey: ["simulados"],
    queryFn: async () => {
      const response = await SimuladoAPI.Listar();
      return Array.isArray(response) ? response : [];
    },
    staleTime: Infinity,
  });

  // ── Handlers ──
  function toggleMateria(m) {
    setMateriasSelecionadas((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  }

  async function handleGerarSimulado() {
    if (!materiasSelecionadas.length || !quantidade) {
      Toast.show({ type: "info", text1: "Preencha todos os campos" });
      return;
    }
    try {
      setLoading(true);
      const id = await SimuladoAPI.GerarSimulado(
        materiasSelecionadas,
        quantidade,
      );
      const data = await SimuladoAPI.Obter(id);
      setSimulado(data);
      setRespostas({});
      setMostrarCriar(false);
      Toast.show({ type: "success", text1: "Simulado gerado com sucesso" });
    } catch {
      Toast.show({ type: "error", text1: "Erro ao gerar simulado" });
    } finally {
      setLoading(false);
    }
  }

  async function handleResponder() {
    const todasRespondidas = simulado.questoes.every(
      (q) => respostas[q.questaoId] !== undefined,
    );
    if (!todasRespondidas) {
      Toast.show({ type: "info", text1: "Responda todas as questões" });
      return;
    }
    try {
      setLoading(true);
      const payload = Object.entries(respostas).map(([q, a]) => ({
        questaoId: Number(q),
        alternativaId: a,
      }));
      const r = await SimuladoAPI.Responder(simulado.simuladoId, payload);
      setResultado(r);
    } catch {
      Toast.show({ type: "error", text1: "Erro ao enviar respostas" });
    } finally {
      setLoading(false);
    }
  }

  function finalizar() {
    setResultado(null);
    setSimulado(null);
    setRespostas({});
    queryClient.invalidateQueries({ queryKey: ["simulados"] });
    queryClient.invalidateQueries({ queryKey: ["totalSimulados"] });
  }

  return (
    <View style={styles.page}>
      <LearnlyHeader title="Simulados">
        <TouchableOpacity
          style={styles.botaoHeader}
          onPress={() => setMostrarCriar(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </LearnlyHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Histórico de simulados ── */}
        {!simulado && (
          <>
            {simulados.length === 0 ? (
              <View style={styles.vazioContainer}>
                <Text style={styles.vazioText}>
                  Nenhum simulado ainda, que tal criar um?
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.historicoTitulo}>Simulados recentes</Text>
                {simulados.map((s) => (
                  <View key={s.simuladoId} style={styles.cardSimulado}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardData}>
                        {new Date(s.data).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </Text>
                      <View style={styles.badgesRow}>
                        <View style={[styles.badge, styles.badgeInfo]}>
                          <Text
                            style={[
                              styles.badgeText,
                              { color: Colors.primary },
                            ]}
                          >
                            {s.questoes.length} questões
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            s.notaFinal >= 6
                              ? styles.badgeSuccess
                              : styles.badgeDanger,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color:
                                  s.notaFinal >= 6
                                    ? Colors.successDark
                                    : Colors.dangerDark,
                              },
                            ]}
                          >
                            Nota {s.notaFinal.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.botaoVisualizar}
                      onPress={() => {
                        const respostasMap = {};
                        (s.respostas || []).forEach((r) => {
                          respostasMap[r.questaoId] = r.alternativaId;
                        });
                        setPreviewRespostas(respostasMap);
                        setSimuladoPreview(s);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.botaoVisualizarText}>Visualizar</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ── Simulado em andamento ── */}
        {simulado && (
          <>
            {simulado.questoes.map((q, i) => (
              <View key={q.questaoId} style={styles.questaoCard}>
                {/* Título da questão */}
                <Text style={styles.questaoTitulo}>
                  {i + 1}. {q.titulo}
                </Text>

                {/* Contexto em Markdown */}
                {q.contexto ? (
                  <Markdown style={markdownStyles}>{q.contexto}</Markdown>
                ) : null}

                {q.introducaoAlternativa ? (
                  <Text style={styles.introducao}>
                    {q.introducaoAlternativa}
                  </Text>
                ) : null}

                {/* Alternativas */}
                {q.alternativas.map((a) => {
                  const marcada = respostas[q.questaoId] === a.alternativaId;
                  return (
                    <TouchableOpacity
                      key={a.alternativaId}
                      style={[
                        styles.alternativaBtn,
                        marcada && styles.alternativaBtnMarcada,
                      ]}
                      onPress={() =>
                        setRespostas({
                          ...respostas,
                          [q.questaoId]: a.alternativaId,
                        })
                      }
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          marcada && styles.radioCircleMarcado,
                        ]}
                      >
                        {marcada && <View style={styles.radioDot} />}
                      </View>
                      <Text style={styles.alternativaLetra}>{a.letra})</Text>
                      <Text style={styles.alternativaTexto} numberOfLines={0}>
                        {a.texto ||
                          getImagemAlternativa(a) ||
                          "(alternativa sem conteúdo)"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Botão enviar */}
            <TouchableOpacity
              style={[styles.botaoEnviar, loading && styles.botaoDesabilitado]}
              onPress={handleResponder}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.botaoEnviarText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* ── Modais ── */}
      <ModalCriarSimulado
        show={mostrarCriar}
        onHide={() => setMostrarCriar(false)}
        loading={loading}
        quantidade={quantidade}
        setQuantidade={setQuantidade}
        materiasSelecionadas={materiasSelecionadas}
        toggleMateria={toggleMateria}
        onGerar={handleGerarSimulado}
      />

      <ModalResultado resultado={resultado} onFinalizar={finalizar} />

      <ModalPreviewSimulado
        simuladoPreview={simuladoPreview}
        previewRespostas={previewRespostas}
        onHide={() => setSimuladoPreview(null)}
      />
    </View>
  );
}

const markdownStyles = {
  body: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  paragraph: { marginBottom: 8 },
  code_inline: {
    backgroundColor: Colors.primaryLight,
    color: Colors.primary,
    fontSize: Typography.xs,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },

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

  historicoTitulo: {
    fontSize: 28,
    fontWeight: "100",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  cardSimulado: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 20,
    gap: 12,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  cardData: {
    fontSize: Typography.base,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
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
  badgeDanger: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.dangerBorder,
  },
  badgeText: { fontSize: Typography.xs, fontWeight: "600" },
  botaoVisualizar: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: "center",
  },
  botaoVisualizarText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: Typography.sm,
  },

  questaoCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 16,
    gap: 10,
    ...Shadow.card,
  },
  questaoTitulo: {
    fontSize: Typography.base,
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  introducao: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  alternativaBtn: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  alternativaBtnMarcada: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 1,
  },
  alternativaTexto: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },

  botaoEnviar: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  botaoDesabilitado: { opacity: 0.55 },
  botaoEnviarText: {
    color: "#fff",
    fontSize: Typography.base,
    fontWeight: "600",
  },
});
