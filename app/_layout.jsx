import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocaleConfig } from "react-native-calendars";
import { AuthProvider, useAuth } from "../utils/AuthContext";
import Toast from "react-native-toast-message";
import { PortalProvider, Portal } from "@gorhom/portal";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

const queryClient = new QueryClient();

function AuthGuard() {
  const { authState } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authState === null) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (!authState && inAuthGroup) {
      router.replace("/login");
    } else if (authState && segments[0] === "login") {
      router.replace("/(tabs)/inicio");
    }
  }, [authState, segments]);

  if (authState === null) return null;

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PortalProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGuard />
        </QueryClientProvider>

        <Portal>
          <Toast />
        </Portal>
      </PortalProvider>
    </AuthProvider>
  );
}
