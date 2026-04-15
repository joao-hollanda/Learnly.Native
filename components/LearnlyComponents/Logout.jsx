import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../utils/AuthContext';
import { Colors } from '../../utils/theme';

export default function Logout() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    console.log("1. Botão de logout clicado!");
    try {
      await signOut();
      console.log("2. Função signOut concluída!");
    } catch (error) {
      console.log("Erro ao deslogar:", error);
      Alert.alert("Erro", "Não foi possível deslogar.");
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.btn}>
      <Ionicons name="log-out-outline" size={26} color={Colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
  },
});