import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import ModalBase, { ModalButton } from "../ModalBase";
import { Colors, Radius, Typography } from "../../../utils/theme";
import PlanoAPI from "../../../services/PlanoService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function displayDate(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

const hoje = formatDate(new Date());

// ─── NativeSelect ─────────────────────────────────────────────────────────────

function NativeSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ width: "100%" }}>
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={selected ? styles.selectValue : styles.selectPlaceholder}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={14}
          color={Colors.textMuted}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            <Text style={styles.dropdownItemClear}>Limpar seleção</Text>
          </TouchableOpacity>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.dropdownItem,
                opt.isDisabled && styles.dropdownItemDisabled,
                opt.value === value && styles.dropdownItemSelected,
              ]}
              onPress={() => {
                if (opt.isDisabled) return;
                onChange(opt);
                setOpen(false);
              }}
              disabled={opt.isDisabled}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  opt.isDisabled && styles.dropdownItemTextDisabled,
                  opt.value === value && styles.dropdownItemTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[styles.progressFill, { width: `${Math.min(value, 100)}%` }]}
      />
    </View>
  );
}

// ─── DatePickerField ──────────────────────────────────────────────────────────

function DatePickerField({ label, value, onPress }) {
  return (
    <View style={[styles.formGroup, { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={value ? styles.dateText : styles.datePlaceholder}>
          {value ? displayDate(value) : "DD/MM/AAAA"}
        </Text>
        <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

// ─── ModalCriarPlano ──────────────────────────────────────────────────────────

export function ModalCriarPlano({ show, onHide, loading, onConfirmar }) {
  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pickerAtivo, setPickerAtivo] = useState(null);

  useEffect(() => {
    if (show) {
      setTitulo("");
      setObjetivo("");
      setDataInicio("");
      setDataFim("");
      setPickerAtivo(null);
    }
  }, [show]);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setPickerAtivo(null);
    if (event.type === "dismissed") return;
    if (!selectedDate) return;
    const str = formatDate(selectedDate);
    if (pickerAtivo === "inicio") {
      setDataInicio(str);
      if (dataFim && dataFim < str) setDataFim("");
    } else {
      setDataFim(str);
    }
    if (Platform.OS === "ios") setPickerAtivo(null);
  };

  return (
    <>
      <ModalBase
        show={show}
        onHide={onHide}
        title="Criar plano"
        iconType="success"
        icon={<Ionicons name="journal-outline" />}
        footer={
          <>
            <ModalButton
              label="Cancelar"
              variant="secondary"
              onPress={onHide}
              disabled={loading}
            />
            <ModalButton
              label={loading ? "" : "Criar plano"}
              variant="primary"
              onPress={() => onConfirmar({ titulo, objetivo, dataInicio, dataFim })}
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
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: ENEM 2026"
            placeholderTextColor={Colors.textPlaceholder}
            value={titulo}
            onChangeText={setTitulo}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Objetivo</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Descreva o objetivo do plano"
            placeholderTextColor={Colors.textPlaceholder}
            value={objetivo}
            onChangeText={setObjetivo}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.row}>
          <DatePickerField
            label="Data de início"
            value={dataInicio}
            onPress={() => setPickerAtivo("inicio")}
          />
          <DatePickerField
            label="Data final"
            value={dataFim}
            onPress={() => setPickerAtivo("fim")}
          />
        </View>
      </ModalBase>

      {pickerAtivo !== null && (
        <DateTimePicker
          value={
            pickerAtivo === "inicio"
              ? parseDate(dataInicio || hoje)
              : parseDate(dataFim || dataInicio || hoje)
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={
            pickerAtivo === "inicio"
              ? parseDate(hoje)
              : parseDate(dataInicio || hoje)
          }
          onChange={handleDateChange}
          locale="pt-BR"
        />
      )}
    </>
  );
}

// ─── ModalCriarPlanoIA ────────────────────────────────────────────────────────

export function ModalCriarPlanoIA({ show, onHide, loading, onConfirmar }) {
  const [objetivo, setObjetivo] = useState("");
  const [horasPorSemana, setHorasPorSemana] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pickerAtivo, setPickerAtivo] = useState(null);

  useEffect(() => {
    if (show) {
      setObjetivo("");
      setHorasPorSemana("");
      setDataFim("");
      setPickerAtivo(null);
    }
  }, [show]);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setPickerAtivo(null);
    if (event.type === "dismissed") return;
    if (!selectedDate) return;
    setDataFim(formatDate(selectedDate));
    if (Platform.OS === "ios") setPickerAtivo(null);
  };

  return (
    <>
      <ModalBase
        show={show}
        onHide={onHide}
        title="Criar plano com IA"
        iconType="warning"
        icon={<Ionicons name="sparkles-outline" />}
        footer={
          <>
            <ModalButton
              label="Cancelar"
              variant="secondary"
              onPress={onHide}
              disabled={loading}
            />
            <ModalButton
              label={loading ? "" : "Gerar plano"}
              variant="primary"
              onPress={() =>
                onConfirmar({
                  objetivo,
                  horasPorSemana: Number(horasPorSemana) || 10,
                  dataFim,
                })
              }
              disabled={loading}
              icon={
                loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="hardware-chip-outline" />
                )
              }
            />
          </>
        }
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Objetivo</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Ex: Passar no ENEM com foco em ciências"
            placeholderTextColor={Colors.textPlaceholder}
            value={objetivo}
            onChangeText={setObjetivo}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Horas por semana</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Ex: 10  (máx: 60)"
            placeholderTextColor={Colors.textPlaceholder}
            value={String(horasPorSemana)}
            onChangeText={(v) => {
              if (v === "") return setHorasPorSemana("");
              const num = parseInt(v, 10);
              if (isNaN(num) || num < 1 || num > 60) return;
              setHorasPorSemana(num);
            }}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data final</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setPickerAtivo("fim")}
            activeOpacity={0.8}
          >
            <Text style={dataFim ? styles.dateText : styles.datePlaceholder}>
              {dataFim ? displayDate(dataFim) : "DD/MM/AAAA"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </ModalBase>

      {pickerAtivo !== null && (
        <DateTimePicker
          value={parseDate(dataFim || hoje)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={parseDate(hoje)}
          onChange={handleDateChange}
          locale="pt-BR"
        />
      )}
    </>
  );
}

// ─── ModalExcluirPlano ────────────────────────────────────────────────────────

export function ModalExcluirPlano({ show, onHide, loading, plano, onConfirmar }) {
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
        Tem certeza que deseja excluir o plano?
      </Text>
      <View style={styles.badgeDanger}>
        <Text style={styles.badgeDangerText}>{plano?.titulo}</Text>
      </View>
      <Text style={styles.smallText}>Essa ação não poderá ser desfeita.</Text>
    </ModalBase>
  );
}

// ─── ModalLancarHoras ────────────────────────────────────────────────────────

export function ModalLancarHoras({ show, onHide, loading, plano, onConfirmar }) {
  const [planoMateriaId, setPlanoMateriaId] = useState("");
  const [horas, setHoras] = useState("");

  const materias = plano?.materias ?? [];
  const materiaSelecionada = materias.find(
    (m) => m.planoMateriaId === planoMateriaId
  );
  const maxHoras = materiaSelecionada
    ? materiaSelecionada.horasTotais - materiaSelecionada.horasConcluidas
    : 0;

  const options = materias.map((m) => ({
    value: m.planoMateriaId,
    label: m.nome,
    isDisabled: m.horasConcluidas >= m.horasTotais,
  }));

  useEffect(() => {
    if (show) {
      setPlanoMateriaId("");
      setHoras("");
    }
  }, [show]);

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Lançar horas"
      iconType="info"
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
            onPress={() => onConfirmar({ planoMateriaId, horas: Number(horas) })}
            disabled={loading || !planoMateriaId || !horas}
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
      <View style={styles.formGroup}>
        <Text style={styles.label}>Matéria</Text>
        <NativeSelect
          options={options}
          value={planoMateriaId}
          onChange={(opt) => {
            setPlanoMateriaId(opt?.value ?? "");
            setHoras("");
          }}
          placeholder="Selecione a matéria"
        />
      </View>

      {materiaSelecionada && (
        <View style={styles.badgeInfo}>
          <Text style={styles.badgeInfoText}>
            Restam {maxHoras}h de {materiaSelecionada.horasTotais}h
          </Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Horas estudadas</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={
            maxHoras > 0 ? `1 – ${maxHoras}h` : "Selecione uma matéria"
          }
          placeholderTextColor={Colors.textPlaceholder}
          value={String(horas)}
          editable={!!planoMateriaId}
          onChangeText={(v) => {
            if (v === "") return setHoras("");
            const num = parseInt(v, 10);
            if (isNaN(num) || num < 1 || num > Math.min(maxHoras, 20)) return;
            setHoras(num);
          }}
        />
      </View>
    </ModalBase>
  );
}

// ─── ModalConfigurarPlano ─────────────────────────────────────────────────────

export function ModalConfigurarPlano({
  show,
  onHide,
  loading,
  plano,
  onSalvar,
  onExcluir,
}) {
  const queryClient = useQueryClient();
  const [aba, setAba] = useState("editar");

  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horasPorSemana, setHorasPorSemana] = useState("");
  const [pickerAtivo, setPickerAtivo] = useState(null);

  const [materiaId, setMateriaId] = useState("");
  const [horasTotais, setHorasTotais] = useState("");
  const [loadingMateria, setLoadingMateria] = useState(false);

  const { data: materiasDisponiveis = [] } = useQuery({
    queryKey: ["materias"],
    queryFn: PlanoAPI.ListarMaterias,
    staleTime: Infinity,
    enabled: show,
  });

  useEffect(() => {
    if (show && plano) {
      setTitulo(plano.titulo ?? "");
      setObjetivo(plano.objetivo ?? "");
      setDataFim(plano.dataFim ? plano.dataFim.split("T")[0] : "");
      setHorasPorSemana(String(plano.horasPorSemana ?? ""));
      setMateriaId("");
      setHorasTotais("");
      setAba("editar");
      setPickerAtivo(null);
    }
  }, [show]);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setPickerAtivo(null);
    if (event.type === "dismissed") return;
    if (!selectedDate) return;
    setDataFim(formatDate(selectedDate));
    if (Platform.OS === "ios") setPickerAtivo(null);
  };

  const matOptions = materiasDisponiveis.map((m) => ({
    value: m.materiaId,
    label: m.nome,
    isDisabled: (plano?.materias ?? []).some(
      (pm) => pm.materiaId === m.materiaId
    ),
  }));

  const todasAdicionadas =
    matOptions.length > 0 && matOptions.every((o) => o.isDisabled);

  async function handleAdicionarMateria() {
    if (!materiaId || !horasTotais) {
      Toast.show({ type: "info", text1: "Selecione a matéria e as horas" });
      return;
    }
    try {
      setLoadingMateria(true);
      await PlanoAPI.AdicionarMateria(plano.planoId, {
        materiaId,
        horasTotais: Number(horasTotais),
      });
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      setMateriaId("");
      setHorasTotais("");
      Toast.show({ type: "success", text1: "Matéria adicionada!" });
    } catch {
      Toast.show({ type: "error", text1: "Erro ao adicionar matéria" });
    } finally {
      setLoadingMateria(false);
    }
  }

  return (
    <>
      <ModalBase
        show={show}
        onHide={onHide}
        title="Configurar plano"
        iconType="info"
        icon={<Ionicons name="settings-outline" />}
        footer={
          aba === "editar" ? (
            <>
              <ModalButton
                label="Excluir"
                variant="danger"
                onPress={onExcluir}
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
                    horasPorSemana: Number(horasPorSemana) || 0,
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
          ) : (
            <ModalButton
              label={loadingMateria ? "" : "+ Adicionar"}
              variant="secondary"
              onPress={handleAdicionarMateria}
              disabled={loadingMateria}
              icon={
                loadingMateria ? (
                  <ActivityIndicator color={Colors.textPrimary} size="small" />
                ) : undefined
              }
            />
          )
        }
      >
        {/* Abas */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, aba === "editar" && styles.tabBtnAtivo]}
            onPress={() => setAba("editar")}
          >
            <Text
              style={[styles.tabText, aba === "editar" && styles.tabTextAtivo]}
            >
              Editar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, aba === "materias" && styles.tabBtnAtivo]}
            onPress={() => setAba("materias")}
          >
            <Text
              style={[
                styles.tabText,
                aba === "materias" && styles.tabTextAtivo,
              ]}
            >
              Matérias
            </Text>
          </TouchableOpacity>
        </View>

        {aba === "editar" ? (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Título do plano"
                placeholderTextColor={Colors.textPlaceholder}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Objetivo</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={objetivo}
                onChangeText={setObjetivo}
                placeholder="Objetivo"
                placeholderTextColor={Colors.textPlaceholder}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Horas por semana</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(horasPorSemana)}
                onChangeText={(v) => {
                  if (v === "") return setHorasPorSemana("");
                  const num = parseInt(v, 10);
                  if (isNaN(num) || num < 0 || num > 168) return;
                  setHorasPorSemana(num);
                }}
                placeholder="Ex: 10"
                placeholderTextColor={Colors.textPlaceholder}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Data final</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setPickerAtivo("fim")}
                activeOpacity={0.8}
              >
                <Text
                  style={dataFim ? styles.dateText : styles.datePlaceholder}
                >
                  {dataFim ? displayDate(dataFim) : "DD/MM/AAAA"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {todasAdicionadas ? (
              <Text style={styles.mutedText}>
                Todas as matérias já foram adicionadas.
              </Text>
            ) : (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Matéria</Text>
                  <NativeSelect
                    options={matOptions}
                    value={materiaId}
                    onChange={(opt) => setMateriaId(opt?.value ?? "")}
                    placeholder="Selecione a matéria"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Horas totais</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="5 – 200h"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={String(horasTotais)}
                    onChangeText={(v) => {
                      if (v === "") return setHorasTotais("");
                      const num = parseInt(v, 10);
                      if (isNaN(num) || num < 5 || num > 200) return;
                      setHorasTotais(num);
                    }}
                  />
                </View>
                <View style={styles.quickRow}>
                  {[10, 20, 40, 60, 80, 100].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.quickBtn,
                        horasTotais === h && styles.quickBtnAtivo,
                      ]}
                      onPress={() => setHorasTotais(h)}
                    >
                      <Text
                        style={[
                          styles.quickBtnText,
                          horasTotais === h && styles.quickBtnTextAtivo,
                        ]}
                      >
                        {h}h
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {(plano?.materias ?? []).length > 0 && (
              <View style={styles.materiasAdicionadas}>
                <Text style={styles.labelSecao}>Matérias do plano</Text>
                {(plano?.materias ?? []).map((m) => (
                  <View key={m.planoMateriaId} style={styles.materiaItem}>
                    <View
                      style={[
                        styles.materiaDot,
                        { backgroundColor: m.cor || Colors.primary },
                      ]}
                    />
                    <Text style={styles.materiaNome}>{m.nome}</Text>
                    <Text style={styles.materiaHoras}>
                      {m.horasConcluidas}h / {m.horasTotais}h
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ModalBase>

      {pickerAtivo !== null && (
        <DateTimePicker
          value={parseDate(dataFim || hoje)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={parseDate(hoje)}
          onChange={handleDateChange}
          locale="pt-BR"
        />
      )}
    </>
  );
}

// ─── ModalVisualizarPlano ─────────────────────────────────────────────────────

export function ModalVisualizarPlano({
  show,
  onHide,
  plano,
  onLancarHoras,
  onConfigurar,
}) {
  const fmtDate = (str) => {
    if (!str) return "";
    return new Date(str).toLocaleDateString("pt-BR");
  };

  const materias = plano?.materias ?? [];
  const horasTotais = materias.reduce((a, m) => a + m.horasTotais, 0);
  const horasConcluidas = materias.reduce((a, m) => a + m.horasConcluidas, 0);
  const progressoGeral =
    horasTotais > 0 ? (horasConcluidas / horasTotais) * 100 : 0;

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title={plano?.titulo ?? "Plano"}
      iconType="info"
      icon={<Ionicons name="book-outline" />}
      footer={
        <>
          <ModalButton
            label="Configurar"
            variant="secondary"
            onPress={onConfigurar}
            icon={<Ionicons name="settings-outline" />}
          />
          <ModalButton
            label="Lançar Horas"
            variant="primary"
            onPress={onLancarHoras}
            icon={<Ionicons name="time-outline" />}
          />
        </>
      }
    >
      {/* Datas + progresso geral */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Início</Text>
          <Text style={styles.infoValue}>{fmtDate(plano?.dataInicio)}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Fim</Text>
          <Text style={styles.infoValue}>{fmtDate(plano?.dataFim)}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Progresso</Text>
          <Text style={[styles.infoValue, { color: Colors.primary }]}>
            {progressoGeral.toFixed(0)}%
          </Text>
        </View>
      </View>

      <ProgressBar value={progressoGeral} />

      {/* Matérias */}
      {materias.length === 0 ? (
        <Text style={styles.mutedText}>Nenhuma matéria adicionada ainda.</Text>
      ) : (
        materias.map((m) => {
          const prog =
            m.horasTotais > 0
              ? (m.horasConcluidas / m.horasTotais) * 100
              : 0;
          return (
            <View key={m.planoMateriaId} style={styles.materiaCard}>
              <View style={styles.materiaCardHeader}>
                <View
                  style={[
                    styles.materiaDot,
                    { backgroundColor: m.cor || Colors.primary },
                  ]}
                />
                <Text style={styles.materiaCardNome}>{m.nome}</Text>
                <Text style={styles.materiaCardHoras}>
                  {m.horasConcluidas}h / {m.horasTotais}h
                </Text>
              </View>
              <ProgressBar value={prog} />
              {m.topicos?.length > 0 && (
                <View style={styles.topicosWrap}>
                  {m.topicos.map((t, i) => (
                    <Text key={i} style={styles.topico}>
                      • {t}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </ModalBase>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Form
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
    borderColor: Colors.borderMedium,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  inputMultiline: {
    minHeight: 72,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  // Date
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    backgroundColor: Colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: { fontSize: Typography.sm, color: Colors.textPrimary },
  datePlaceholder: { fontSize: Typography.sm, color: Colors.textPlaceholder },

  // NativeSelect
  selectTrigger: {
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    backgroundColor: Colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectValue: { fontSize: Typography.base, color: Colors.textPrimary },
  selectPlaceholder: {
    fontSize: Typography.base,
    color: Colors.textPlaceholder,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    marginTop: 4,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownItemDisabled: { opacity: 0.4 },
  dropdownItemSelected: { backgroundColor: Colors.primaryLight },
  dropdownItemText: { fontSize: Typography.sm, color: Colors.textPrimary },
  dropdownItemTextDisabled: { color: Colors.textMuted },
  dropdownItemTextSelected: { color: Colors.primary, fontWeight: "600" },
  dropdownItemClear: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontStyle: "italic",
  },

  // Progress
  progressTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 99,
    overflow: "hidden",
    width: "100%",
    marginVertical: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 99,
  },

  // Badges
  badgeDanger: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeDangerText: {
    fontSize: Typography.xs,
    fontWeight: "600",
    color: Colors.dangerDark,
  },
  badgeInfo: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeInfoText: {
    fontSize: Typography.xs,
    fontWeight: "600",
    color: Colors.primary,
  },

  // Text
  bodyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  smallText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: "center",
  },
  mutedText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: Radius.sm,
    padding: 3,
    width: "100%",
    marginBottom: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radius.sm - 2,
    alignItems: "center",
  },
  tabBtnAtivo: {
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    fontSize: Typography.xs,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  tabTextAtivo: { color: Colors.textPrimary },

  // Quick hour buttons
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.background,
  },
  quickBtnAtivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quickBtnText: { fontSize: Typography.xs, color: "#475569", fontWeight: "500" },
  quickBtnTextAtivo: { color: "#fff" },

  // Matérias (configurar)
  materiasAdicionadas: {
    width: "100%",
    marginTop: 8,
  },
  labelSecao: {
    fontSize: Typography.xs,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  materiaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  materiaDot: { width: 8, height: 8, borderRadius: 4 },
  materiaNome: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  materiaHoras: { fontSize: Typography.xs, color: Colors.textMuted },

  // Matérias (visualizar)
  materiaCard: {
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  materiaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  materiaCardNome: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  materiaCardHoras: { fontSize: Typography.xs, color: Colors.textMuted },
  topicosWrap: { marginTop: 4, paddingLeft: 16 },
  topico: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Info row (visualizar)
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    marginBottom: 4,
  },
  infoItem: { alignItems: "center" },
  infoLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  infoDivider: { width: 1, height: 24, backgroundColor: Colors.border },
});

export default {
  ModalCriarPlano,
  ModalCriarPlanoIA,
  ModalConfigurarPlano,
  ModalVisualizarPlano,
  ModalLancarHoras,
  ModalExcluirPlano,
};
