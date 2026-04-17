import { Redirect } from "expo-router";
import { useAuth } from "../utils/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { authState } = useAuth();

  if (authState === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e3a8a' }}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return <Redirect href={!authState ? "/login" : "/(tabs)/inicio"} />;
}