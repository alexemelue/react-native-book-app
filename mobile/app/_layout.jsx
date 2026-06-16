import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import Loader from "../components/Loader";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { user, checkAuth, token, isCheckingAuth } = useAuthStore();
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  useEffect(() => {
    const init = async () => {
      await checkAuth();
    };
    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isCheckingAuth) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isCheckingAuth]);

  // handle navigation based on the auth state
  useEffect(() => {
    if (isCheckingAuth || !segments || segments.length === 0) return;
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = !!user && !!token;

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [user, token, segments, isCheckingAuth]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        {!fontsLoaded || isCheckingAuth ? (
          <Loader />
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            {/* <Stack.Screen name="index" options={{ title: "Home" }} /> */}
            {/* <Stack.Screen name="index" /> */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        )}
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
