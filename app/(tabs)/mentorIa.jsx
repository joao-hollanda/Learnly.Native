import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MentorIAAPI from "../../services/MentorIAService";
import { Colors, Shadow, Typography } from "../../utils/theme";

const MENSAGEM_INICIAL = {
  autor: "ia",
  texto:
    "Olá! \nSou o MentorIA, sua Inteligência Artificial preparada pra atender suas necessidades.\nPode mandar sua dúvida 😊",
};

function LoadingDots() {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDot((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={styles.loadingRow}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, { opacity: dot > i ? 1 : 0.3 }]} />
      ))}
    </View>
  );
}

export default function MentorIA() {
  const insets = useSafeAreaInsets();
  const flatRef = useRef(null);

  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([MENSAGEM_INICIAL]);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [digitandoIA, setDigitandoIA] = useState(false);

  useEffect(() => {
    if (conversa.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [conversa]);

  function escreverTextoAosPoucos(texto, velocidade = 1) {
    let i = 0;
    setDigitandoIA(true);
    const interval = setInterval(() => {
      i++;
      setConversa((prev) => {
        const nova = [...prev];
        nova[nova.length - 1] = { autor: "ia", texto: texto.slice(0, i) };
        return nova;
      });
      if (i >= texto.length) {
        clearInterval(interval);
        setDigitandoIA(false);
      }
    }, velocidade);
  }

  async function enviarMensagem() {
    if (!mensagem.trim() || carregandoIA || digitandoIA) return;

    const pergunta = mensagem.trim();
    setMensagem("");
    setCarregandoIA(true);

    setConversa((prev) => [
      ...prev,
      { autor: "aluno", texto: pergunta },
      { autor: "ia", tipo: "loading" },
    ]);

    try {
      const mensagensParaIA = [
        ...conversa
          .filter((m) => m.texto)
          .map((m) => ({
            role: m.autor === "aluno" ? "user" : "assistant",
            content: m.texto,
          })),
        { role: "user", content: pergunta },
      ];

      const resposta = await MentorIAAPI.EnviarMensagem({
        Mensagens: mensagensParaIA,
      });
      const respostaIA = resposta.resposta;

      setConversa((prev) => [
        ...prev.filter((m) => m.tipo !== "loading"),
        { autor: "ia", texto: "" },
      ]);

      escreverTextoAosPoucos(respostaIA);
    } catch {
      setConversa((prev) => [
        ...prev.filter((m) => m.tipo !== "loading"),
        {
          autor: "ia",
          texto: "Ocorreu um erro ao falar com a IA. Tente novamente.",
        },
      ]);
    } finally {
      setCarregandoIA(false);
    }
  }

  function renderItem({ item }) {
    if (item.tipo === "loading") {
      return (
        <View style={[styles.balao, styles.balaoIA]}>
          <LoadingDots />
        </View>
      );
    }
    const isAluno = item.autor === "aluno";
    return (
      <View
        style={[styles.balao, isAluno ? styles.balaoAluno : styles.balaoIA]}
      >
        <Markdown style={isAluno ? mdAluno : mdIA}>{item.texto}</Markdown>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <FlatList
        ref={flatRef}
        data={conversa}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={[styles.chat, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={mensagem}
            onChangeText={setMensagem}
            placeholder="Digite sua dúvida..."
            placeholderTextColor={Colors.textPlaceholder}
            multiline
            editable={!carregandoIA && !digitandoIA}
            onSubmitEditing={enviarMensagem}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (carregandoIA || digitandoIA) && styles.sendBtnDisabled,
            ]}
            onPress={enviarMensagem}
            disabled={carregandoIA || digitandoIA}
            activeOpacity={0.85}
          >
            {carregandoIA ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background, paddingTop: 40 },
  chat: { padding: 16, gap: 10 },
  balao: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  balaoAluno: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    ...Shadow.card,
  },
  balaoIA: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
    ...Shadow.card,
  },
  loadingRow: {
    flexDirection: "row",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Colors.textMuted,
  },
  inputWrapper: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 6,
    ...Shadow.card,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    maxHeight: 120,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: Colors.textMuted },
});

const mdAluno = {
  body: { fontSize: Typography.base, color: "#fff", lineHeight: 22 },
  paragraph: { marginBottom: 0 },
};
const mdIA = {
  body: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  paragraph: { marginBottom: 4 },
  code_inline: {
    backgroundColor: Colors.primaryLight,
    color: Colors.primary,
    fontSize: Typography.xs,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
};
