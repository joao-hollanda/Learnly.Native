import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Calendar } from 'react-native-calendars';
import LearnlyHeader from '../../components/LearnlyComponents/HeaderLearnly';
import Logout from '../../components/LearnlyComponents/Logout';
import Card from '../../components/LearnlyComponents/Card';
import Bolinha from '../../components//LearnlyComponents/Bolinha';

import { ModalCriarEvento, ModalResetEventos } from '../../components/Modais/Inicio/ModaisInicio';

import PlanoAPI from '../../services/PlanoService';
import SimuladoAPI from '../../services/SimuladoService';
import EventoEstudoAPI from '../../services/EventoService';
import { getUserData } from '../../utils/userHelper';
import { Colors, Radius, Shadow, Typography } from '../../utils/theme';

// ─── helpers ────────────────────────────────────────────────────────────────
const toUtcString = (date) => date.toISOString().slice(0, 19);

function getStatusEvento(evento, agora) {
  const inicio = new Date(evento.start).getTime();
  const fim = new Date(evento.end).getTime();
  const now = agora.getTime();
  if (now < inicio) return 'proximo';
  if (now >= inicio && now <= fim) return 'atual';
  return 'concluido';
}

const STATUS_COLOR = {
  concluido: Colors.eventConcluido,
  atual: Colors.eventAtual,
  proximo: Colors.eventProximo,
};

// ─── Componente de card de métrica ───────────────────────────────────────────
function MetricCard({ titulo, valor, adicional, icon }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitulo}>{titulo}</Text>
        <View style={styles.metricIcon}>{icon}</View>
      </View>
      <Text style={styles.metricValor}>{valor}</Text>
      {adicional ? <Text style={styles.metricAdicional}>{adicional}</Text> : null}
    </View>
  );
}

// ─── Início ──────────────────────────────────────────────────────────────────
export default function Inicio() {
  const queryClient = useQueryClient();
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [mostrarModalReset, setMostrarModalReset] = useState(false);
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    inicio: '',
    fim: '',
    diasSemana: [],
  });

  useEffect(() => {
    const interval = setInterval(() => setHoraAtual(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Queries ──
  const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: getUserData,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: planoAtivo } = useQuery({
    queryKey: ['planoAtivo'],
    queryFn: () => PlanoAPI.ObterPlanoAtivo(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: totalSimulados = 0 } = useQuery({
    queryKey: ['totalSimulados'],
    queryFn: () => SimuladoAPI.Contar(),
    staleTime: Infinity,
  });

  const { data: resumo } = useQuery({
    queryKey: ['resumo'],
    queryFn: () => PlanoAPI.ObterResumo(),
  });

  const { data: comparacaoHoras = { horasHoje: 0, diferenca: 0 } } = useQuery({
    queryKey: ['comparacaoHoras'],
    queryFn: () => PlanoAPI.CompararHoras(),
  });

  const { data: eventosRaw = [], isRefetching } = useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const eventosApi = await EventoEstudoAPI.Listar();
      return eventosApi.map((e) => ({
        id: e.eventoId,
        title: e.titulo,
        start: new Date(e.inicio),
        end: new Date(e.fim),
      }));
    },
    staleTime: Infinity,
  });

  // ── Dados derivados ──
  const eventosComStatus = eventosRaw.map((ev) => ({
    ...ev,
    status: getStatusEvento(ev, horaAtual),
  }));

  const eventosHoje = eventosComStatus
    .filter((ev) => new Date(ev.start).toDateString() === horaAtual.toDateString())
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const percentualGeral =
    resumo && resumo.horasTotais > 0
      ? Math.round((resumo.horasConcluidas / resumo.horasTotais) * 100)
      : 0;

  // ── Monta markedDates para react-native-calendars ──
  // Cada data com evento recebe um dot colorido
  const markedDates = {};
  eventosComStatus.forEach((ev) => {
    const key = new Date(ev.start).toISOString().split('T')[0];
    if (!markedDates[key]) {
      markedDates[key] = { dots: [] };
    }
    markedDates[key].dots.push({ color: STATUS_COLOR[ev.status] || Colors.primary });
  });

  // ── Handlers ──
  async function handleCriarEventos() {
    if (!planoAtivo) {
      Toast.show({ type: 'error', text1: 'Plano ativo ainda não carregado' });
      return;
    }

    const { titulo, inicio, fim, diasSemana } = novoEvento;
    if (!titulo || !inicio || !fim || diasSemana.length === 0) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos' });
      return;
    }
    if (inicio === fim) {
      Toast.show({ type: 'error', text1: 'Hora início e fim não podem ser iguais' });
      return;
    }

    const [hIni, mIni] = inicio.split(':').map(Number);
    const [hFim, mFim] = fim.split(':').map(Number);

    const dataFimPlano = new Date(planoAtivo.dataFim);
    dataFimPlano.setHours(23, 59, 59, 999);

    const fimBase = new Date();
    fimBase.setHours(hFim, mFim, 0, 0);
    const inicioBase = new Date();
    inicioBase.setHours(hIni, mIni, 0, 0);
    if (fimBase < inicioBase) fimBase.setDate(fimBase.getDate() + 1);

    const duracaoMinutos = (fimBase.getTime() - inicioBase.getTime()) / 60000;
    if (duracaoMinutos < 60) {
      Toast.show({ type: 'error', text1: 'Eventos devem ter no mínimo 1 hora' });
      return;
    }
    if (duracaoMinutos > 360) {
      Toast.show({ type: 'error', text1: 'Eventos não podem ter mais de 6 horas' });
      return;
    }

    const dataLoop = new Date();
    dataLoop.setHours(0, 0, 0, 0);
    const lista = [];

    while (dataLoop <= dataFimPlano) {
      if (diasSemana.includes(dataLoop.getDay())) {
        const ini = new Date(dataLoop);
        ini.setHours(hIni, mIni, 0, 0);
        const fimEvento = new Date(dataLoop);
        fimEvento.setHours(hFim, mFim, 0, 0);
        if (fimEvento < ini) fimEvento.setDate(fimEvento.getDate() + 1);
        lista.push({ titulo, inicio: toUtcString(ini), fim: toUtcString(fimEvento) });
      }
      dataLoop.setDate(dataLoop.getDate() + 1);
    }

    if (lista.length === 0) {
      Toast.show({ type: 'info', text1: 'Nenhum evento gerado no período selecionado.' });
      return;
    }

    try {
      setLoading(true);
      const LOTE = 100;
      for (let i = 0; i < lista.length; i += LOTE) {
        await EventoEstudoAPI.CriarEmLote({ eventos: lista.slice(i, i + LOTE) });
      }
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      setMostrarModalEvento(false);
      setNovoEvento({ titulo: '', inicio: '', fim: '', diasSemana: [] });
      Toast.show({ type: 'success', text1: 'Eventos criados com sucesso!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao salvar eventos no servidor.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetEventos() {
    try {
      setLoading(true);
      await EventoEstudoAPI.Remover();
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      Toast.show({ type: 'success', text1: 'Todos os eventos foram removidos!' });
      setMostrarModalReset(false);
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao resetar eventos' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      <LearnlyHeader>
        <Logout />
      </LearnlyHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => queryClient.invalidateQueries()}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Saudação */}
        <Text style={styles.saudacao}>Olá, {userData?.nome || 'Usuário'}!</Text>
        <Text style={styles.subtitulo}>Aqui está seu resumo</Text>

        {/* ── Cards de métricas ── */}
        <View style={styles.metricsGrid}>
          <MetricCard
            titulo="Horas de estudo hoje"
            valor={`${comparacaoHoras.horasHoje}h`}
            adicional={
              comparacaoHoras.diferenca === 0
                ? 'Mesmo que ontem'
                : comparacaoHoras.diferenca > 0
                ? `+${comparacaoHoras.diferenca}h desde ontem`
                : `${comparacaoHoras.diferenca}h desde ontem`
            }
            icon={<Ionicons name="time-outline" size={16} color={Colors.textMuted} />}
          />
          <MetricCard
            titulo="Plano Atual"
            valor={planoAtivo ? planoAtivo.titulo : '-'}
            icon={<Ionicons name="document-text-outline" size={16} color={Colors.textMuted} />}
          />
          <MetricCard
            titulo="Progresso geral"
            valor={`${percentualGeral}%`}
            adicional={
              resumo
                ? `${resumo.horasConcluidas}/${resumo.horasTotais} horas concluídas`
                : 'Carregando...'
            }
            icon={<Ionicons name="trending-up-outline" size={16} color={Colors.textMuted} />}
          />
          <MetricCard
            titulo="Simulados concluídos"
            valor={String(totalSimulados)}
            icon={<Ionicons name="school-outline" size={16} color={Colors.textMuted} />}
          />
        </View>

        {/* ── Cronograma do dia ── */}
        <Card
          titulo="Cronograma de hoje"
          icon={<Ionicons name="school-outline" size={14} color={Colors.textMuted} />}
          subtitulo="Suas sessões de estudo para hoje"
          style={styles.cardFull}
        >
          {eventosHoje.length === 0 ? (
            <Text style={styles.vazioText}>Nenhum evento para hoje</Text>
          ) : (
            eventosHoje.map((ev, i) => (
              <View key={i} style={styles.eventoRow}>
                <Bolinha cor={STATUS_COLOR[ev.status]} tamanho="pequena" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventoTitulo}>{ev.title}</Text>
                  <Text style={styles.eventoHora}>
                    {new Date(ev.start).getHours()}h – {new Date(ev.end).getHours()}h
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* ── Calendário ── */}
        <Card
          titulo="Calendário"
          icon={<Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />}
          style={styles.cardFull}
          detalhe={
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <TouchableOpacity
                style={styles.calBtn}
                onPress={() => setMostrarModalEvento(true)}
              >
                <Ionicons name="add" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.calBtn, styles.calBtnReset]}
                onPress={() => setMostrarModalReset(true)}
              >
                <Ionicons name="refresh-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          }
        >
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            theme={{
              backgroundColor: Colors.surface,
              calendarBackground: Colors.surface,
              todayTextColor: Colors.primary,
              selectedDayBackgroundColor: Colors.primary,
              arrowColor: Colors.primary,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.textMuted,
              dotColor: Colors.primary,
              monthTextColor: Colors.textPrimary,
              textDayFontSize: 13,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 11,
            }}
          />
          {/* Legenda */}
          <View style={styles.legendaRow}>
            {[
              { label: 'Concluído', color: Colors.eventConcluido },
              { label: 'Em curso', color: Colors.eventAtual },
              { label: 'Próximo', color: Colors.eventProximo },
            ].map((l) => (
              <View key={l.label} style={styles.legendaItem}>
                <View style={[styles.legendaDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendaText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <ModalCriarEvento
        show={mostrarModalEvento}
        onHide={() => setMostrarModalEvento(false)}
        novoEvento={novoEvento}
        setNovoEvento={setNovoEvento}
        onConfirmar={handleCriarEventos}
        loading={loading}
      />

      <ModalResetEventos
        show={mostrarModalReset}
        onHide={() => setMostrarModalReset(false)}
        onConfirmar={handleResetEventos}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  saudacao: {
    fontSize: Typography.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitulo: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    marginTop: -8,
    marginBottom: 4,
  },

  // ── Métricas ──
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 16,
    // Ocupa ~50% menos o gap — 2 colunas
    width: '47.5%',
    gap: 6,
    ...Shadow.card,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricTitulo: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  metricIcon: {
    marginLeft: 4,
  },
  metricValor: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metricAdicional: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  // ── Cards grandes ──
  cardFull: {
    width: '100%',
  },

  // ── Cronograma ──
  eventoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eventoTitulo: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  eventoHora: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  vazioText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },

  // ── Calendário ──
  calBtn: {
    borderRadius: Radius.full,
    padding: 6,
  },
  calBtnReset: {
    // herdado
  },
  legendaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
