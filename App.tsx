import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, View, Text } from "react-native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme";
import { ComplaintsProvider } from "./src/store/complaints-store";
import { AuthProvider } from "./src/store/auth-store";
import { AppHeader } from "./src/components/AppHeader";

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: 'Ionicons';
      src: url('https://unpkg.com/react-native-vector-icons@10.0.3/Fonts/Ionicons.ttf') format('truetype');
    }
  `;
  document.head.appendChild(style);
}

function useWebMobileShell() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    const existing = document.querySelector('meta[name="viewport"]');
    if (!existing) {
      const m = document.createElement("meta");
      m.name = "viewport";
      m.content =
        "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover";
      document.head.appendChild(m);
    }

    // Inject Cairo Font
    const existingFont = document.getElementById('cairo-font');
    if (!existingFont) {
        const fontLink = document.createElement("link");
        fontLink.id = "cairo-font";
        fontLink.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap";
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);
        
        const style = document.createElement("style");
        style.textContent = `
          body {
            font-family: 'Cairo', sans-serif;
          }
          input, button, textarea, select {
            font-family: 'Cairo', sans-serif;
          }
        `;
        document.head.appendChild(style);
    }
  }, []);
}

class ErrorBoundary extends React.Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" }}>
          <Text style={{ fontSize: 20, color: "red", textAlign: "right" }}>حدث خطأ داخلي (مرحلة الإنتاج):</Text>
          <Text style={{ color: "black", marginTop: 10, textAlign: "left" }}>{String(this.state.error)}</Text>
          <Text style={{ color: "#666", marginTop: 10, textAlign: "left", fontSize: 10 }}>{this.state.error?.stack}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useWebMobileShell();
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ComplaintsProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <View style={styles.shell}>
            {/* Using layout-specific headers (WebDashboardLayout) rather than global header */}
            <View style={styles.content}>
              <RootNavigator />
            </View>
          </View>
        </SafeAreaView>
      </ComplaintsProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface, // Background should match header for seamless look
  },
  shell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
