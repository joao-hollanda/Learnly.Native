import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../utils/AuthContext";
import service from "../services/LoginService";

const Login = () => {
  const { signIn } = useAuth();
  const [modo, setModo] = useState("login");
  const [carregando, setCarregando] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuario, setUsuario] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.toLowerCase());
  const senhaValida = (v) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])([^\s]){8,}$/.test(v);

  const aoEnviar = async () => {
    if (!email || !senha)
      return Alert.alert("Aviso", "Preencha todos os campos!");
    if (!emailValido(email)) return Alert.alert("Aviso", "E-mail inválido.");

    if (modo === "cadastro") {
      if (!usuario) return Alert.alert("Erro", "Informe o nome de usuário.");
      if (!senhaValida(senha))
        return Alert.alert("Erro", "A senha não atende aos requisitos.");
      if (senha !== confirmarSenha)
        return Alert.alert("Erro", "As senhas não coincidem.");
    }

    setCarregando(true);
    try {
      if (modo === "login") {
        await signIn(email, senha); 
      } else {
        await service.Register(usuario, email, senha);
        Alert.alert("Sucesso", "Conta criada! Faça login.");
        setModo("login");
      }
    } catch (erro) {
      console.log("Erro no login/cadastro:", erro);
      Alert.alert(
        "Erro",
        erro.response?.data || "Usuário ou senha incorretos!",
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Learnly</Text>
          <Text style={styles.subtitulo}>
            {modo === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
          </Text>
        </View>

        <View style={styles.abasContainer}>
          <TouchableOpacity
            style={[styles.aba, modo === "login" && styles.abaAtiva]}
            onPress={() => setModo("login")}
          >
            <Text
              style={[
                styles.abaTexto,
                modo === "login" && styles.abaTextoAtivo,
              ]}
            >
              Entrar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aba, modo === "cadastro" && styles.abaAtiva]}
            onPress={() => setModo("cadastro")}
          >
            <Text
              style={[
                styles.abaTexto,
                modo === "cadastro" && styles.abaTextoAtivo,
              ]}
            >
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {modo === "cadastro" && (
            <View style={styles.campo}>
              <Text style={styles.label}>Nome de usuário</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                value={usuario}
                onChangeText={setUsuario}
              />
            </View>
          )}

          <View style={styles.campo}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputSenhaWrapper}>
              <TextInput
                style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                placeholder="••••••••"
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <Ionicons
                  name={mostrarSenha ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {modo === "cadastro" && (
            <View style={styles.campo}>
              <Text style={styles.label}>Confirmar senha</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry={!mostrarSenha}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.botaoEnviar}
            onPress={aoEnviar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.botaoTexto}>
                {modo === "login" ? "Entrar" : "Cadastrar"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e3a8a" },
  scrollContent: { padding: 30, justifyContent: "center", minHeight: "100%" },
  header: { marginBottom: 40, alignItems: "center" },
  titulo: { fontSize: 32, fontWeight: "bold", color: "#FFF" },
  subtitulo: { fontSize: 16, color: "#bfdbfe", marginTop: 10 },
  abasContainer: {
    flexDirection: "row",
    marginBottom: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 5,
  },
  aba: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  abaAtiva: { backgroundColor: "#2563eb" },
  abaTexto: { color: "#bfdbfe", fontWeight: "600" },
  abaTextoAtivo: { color: "#FFF" },
  form: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  campo: { marginBottom: 20 },
  label: { fontSize: 14, color: "#444", marginBottom: 5, fontWeight: "600" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
    fontSize: 16,
  },
  inputSenhaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  botaoEnviar: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});

export default Login;