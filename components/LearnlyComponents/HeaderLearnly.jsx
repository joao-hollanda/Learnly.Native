import { View, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LearnlyHeader({ children }) {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: top + 12 }]}>
      <Image source={require("@/assets/images/Logo.png")} style={styles.logo} />
      {children && <View style={styles.actions}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});