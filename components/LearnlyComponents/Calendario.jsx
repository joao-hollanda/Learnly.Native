import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';

// 1. Configurar o idioma para Português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

// Mapeamento de cores baseado no teu CSS original
const STATUS_COLORS = {
  concluido: '#22c55e',
  atual: '#3b82f6',
  proximo: '#ef4444',
  default: '#5B72F2'
};

export default function Calendario({ eventos = [] }) {
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  // 2. Transformar a tua lista de eventos no formato que o react-native-calendars entende
  const markedDates = useMemo(() => {
    const marcacoes = {};

    eventos.forEach((evento) => {
      // Garantir que temos um objeto Date válido
      const dataInicio = evento.start instanceof Date ? evento.start : new Date(evento.start);
      const dataFormatada = format(dataInicio, 'yyyy-MM-dd'); // Ex: "2023-10-25"

      if (!marcacoes[dataFormatada]) {
        marcacoes[dataFormatada] = { dots: [], eventosDoDia: [] };
      }

      const cor = STATUS_COLORS[evento.status] || STATUS_COLORS.default;

      // Adiciona uma bolinha no calendário para este evento
      marcacoes[dataFormatada].dots.push({ color: cor, key: evento.title });
      // Guarda o evento para mostrar no Modal
      marcacoes[dataFormatada].eventosDoDia.push(evento);
    });

    return marcacoes;
  }, [eventos]);

  // 3. Função quando tocam num dia
  const handleDayPress = (day) => {
    const dataString = day.dateString;
    const marcacao = markedDates[dataString];

    if (marcacao && marcacao.eventosDoDia.length > 0) {
      setDiaSelecionado({
        dataString: day.dateString,
        dataObj: new Date(day.timestamp),
        eventos: marcacao.eventosDoDia
      });
      setModalVisivel(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* O CALENDÁRIO */}
      <Calendar
        markingType={'multi-dot'}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#94a3b8',
          selectedDayBackgroundColor: '#eff6ff',
          selectedDayTextColor: '#2563eb',
          todayTextColor: '#2563eb',
          dayTextColor: '#64748b',
          textDisabledColor: '#cbd5e1',
          dotColor: '#5B72F2',
          monthTextColor: '#1e293b',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '700',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
          'stylesheet.calendar.header': {
            dayHeader: {
              marginTop: 2,
              marginBottom: 7,
              width: 32,
              textAlign: 'center',
              fontSize: 12,
              color: '#94a3b8',
              fontWeight: 'bold'
            }
          }
        }}
        style={styles.calendarCard}
      />

      {/* O "TOOLTIP" / MODAL PARA MOSTRAR OS EVENTOS DO DIA */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisivel(false)} // Fecha ao clicar fora
        >
          <View style={styles.tooltipContainer}>
            {/* Header do Tooltip */}
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipHeaderText}>
                {diaSelecionado?.dataObj 
                  ? format(diaSelecionado.dataObj, 'dd/MM/yyyy') 
                  : ''}
              </Text>
            </View>

            {/* Lista de Eventos do Dia */}
            {diaSelecionado?.eventos.map((e, index) => {
              const dataInicio = e.start instanceof Date ? e.start : new Date(e.start);
              const dataFim = e.end instanceof Date ? e.end : new Date(e.end);
              
              const horaInicio = format(dataInicio, 'HH:mm');
              const horaFim = format(dataFim, 'HH:mm');
              const cor = STATUS_COLORS[e.status] || STATUS_COLORS.default;

              return (
                <View key={index} style={styles.tooltipItem}>
                  <View style={[styles.tooltipDot, { backgroundColor: cor }]} />
                  <Text style={styles.tooltipText}>
                    <Text style={{ fontWeight: 'bold' }}>{e.title}</Text> ({horaInicio} - {horaFim})
                  </Text>
                </View>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  calendarCard: {
    borderWidth: 1,
    borderColor: '#e9edf2',
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 10,
    // Sombras
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Estilos do Modal (Substituto do Tooltip)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fundo escurecido suave
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    width: '80%',
    maxWidth: 320,
    // Sombras fortes iguais ao tooltip web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  tooltipHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  tooltipHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  tooltipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tooltipText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
});