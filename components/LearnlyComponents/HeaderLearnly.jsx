import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function HeaderLearnly() {
  return (
    <View style={styles.header}>
      <Image source={require("@/assets/images/Logo.png")} style={styles.logo} />
      <TouchableOpacity style={styles.botaoSair}>
        <MaterialIcons
          name={"logout"}
          size={24}
          color={"#4A90E2"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { width: 30, height: 30, marginLeft: 20, marginTop: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  headerTitulo: { fontSize: 18, fontWeight: "bold", color: "#2C3E50" },
  botaoSair: { padding: 8, marginTop: 10 },
  textoBotaoSair: { color: "#E74C3C", fontWeight: "600" },
});
