import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../utils/AuthContext";

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
      <QueryClientProvider client={queryClient}>
        <AuthGuard />
      </QueryClientProvider>
    </AuthProvider>
  );
}