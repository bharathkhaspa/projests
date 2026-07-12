// SnapScan — point your phone at a receipt, get a structured expense + history.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Image, SafeAreaView,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";

// ⚠️ On a real phone, set this to your computer's LAN IP (run `ipconfig`) —
// the phone can't reach "localhost" on your PC. For web/browser use, localhost is correct.
const SERVER_URL = "http://192.168.1.100:3900"; // ← your PC's LAN IP

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍔", groceries: "🛒", transport: "🚕", shopping: "🛍️",
  utilities: "💡", entertainment: "🎬", health: "💊", other: "🧾",
};

type Item = { name: string; quantity: number | null; price: number | null };
type Expense = {
  is_receipt: boolean; merchant: string; date: string; currency: string;
  total: number | null; tax: number | null; category: string; items: Item[];
};
type HistoryEntry = Expense & { scannedAt: string };

export default function App() {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tab, setTab] = useState<"scan" | "history">("scan");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("history").then((raw) => raw && setHistory(JSON.parse(raw)));
  }, []);

  const saveHistory = async (next: HistoryEntry[]) => {
    setHistory(next);
    await AsyncStorage.setItem("history", JSON.stringify(next));
  };

  const pick = async (fromCamera: boolean) => {
    setError(null);
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setError("Permission denied — allow camera/photos access to scan.");

    const opts: ImagePicker.ImagePickerOptions = { base64: true, quality: 0.6 };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (result.canceled || !result.assets[0].base64) return;

    setPreview(result.assets[0].uri);
    setExpense(null);
    scan(result.assets[0].base64, result.assets[0].mimeType ?? "image/jpeg");
  };

  const scan = async (base64: string, mediaType: string) => {
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch(`${SERVER_URL}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error ?? "scan failed");
      const exp: Expense = json.expense;
      setExpense(exp);
      if (exp.is_receipt) {
        await saveHistory([{ ...exp, scannedAt: new Date().toISOString() }, ...history].slice(0, 100));
      }
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  const removeEntry = (scannedAt: string) =>
    saveHistory(history.filter((h) => h.scannedAt !== scannedAt));

  const money = (v: number | null, cur: string) =>
    v == null ? "—" : `${cur === "INR" ? "₹" : cur ? cur + " " : ""}${v.toFixed(2)}`;

  // spending summary for the history tab
  const totalSpend = history.reduce((sum, h) => sum + (h.total ?? 0), 0);
  const mainCurrency = history[0]?.currency ?? "";
  const byCategory = Object.entries(
    history.reduce<Record<string, number>>((acc, h) => {
      acc[h.category] = (acc[h.category] ?? 0) + (h.total ?? 0);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>📸 SnapScan</Text>
        <Text style={s.tagline}>Receipts → structured expenses, instantly</Text>
      </View>

      <View style={s.tabs}>
        {(["scan", "history"] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabOn]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextOn]}>
              {t === "scan" ? "Scan" : `History (${history.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <TouchableOpacity style={s.errBanner} onPress={() => setError(null)}>
          <Text style={s.errText}>⚠ {error}   ✕</Text>
        </TouchableOpacity>
      )}

      {tab === "scan" ? (
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <View style={s.row}>
            <TouchableOpacity style={s.big} onPress={() => pick(true)} disabled={busy}>
              <Text style={s.bigText}>📷 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.big, s.bigAlt]} onPress={() => pick(false)} disabled={busy}>
              <Text style={s.bigText}>🖼️ Gallery</Text>
            </TouchableOpacity>
          </View>

          {!preview && !busy && (
            <View style={s.emptyState}>
              <Text style={{ fontSize: 40 }}>🧾</Text>
              <Text style={s.emptyTitle}>Scan your first receipt</Text>
              <Text style={s.muted}>
                Snap a photo or pick one from your gallery. Crumpled, faded thermal
                receipts welcome — the AI reads them anyway.
              </Text>
            </View>
          )}

          {preview && <Image source={{ uri: preview }} style={s.preview} resizeMode="contain" />}

          {busy && (
            <View style={s.center}>
              <ActivityIndicator size="large" color="#5b8cff" />
              <Text style={s.muted}>Reading receipt…</Text>
            </View>
          )}

          {expense && !expense.is_receipt && (
            <View style={s.emptyState}>
              <Text style={{ fontSize: 34 }}>🤔</Text>
              <Text style={s.emptyTitle}>That doesn't look like a receipt</Text>
              <Text style={s.muted}>Nothing was saved. Try again with a bill or invoice.</Text>
            </View>
          )}

          {expense?.is_receipt && (
            <View style={s.card}>
              <View style={s.cardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={s.merchant}>{expense.merchant || "Unknown merchant"}</Text>
                  <Text style={s.mutedLeft}>
                    {CATEGORY_ICONS[expense.category] ?? "🧾"} {expense.category} · {expense.date || "no date"}
                  </Text>
                </View>
                <Text style={s.total}>{money(expense.total, expense.currency)}</Text>
              </View>
              {expense.tax != null && (
                <Text style={s.mutedLeft}>incl. tax {money(expense.tax, expense.currency)}</Text>
              )}
              {expense.items.length > 0 && <View style={s.divider} />}
              {expense.items.map((it, i) => (
                <View key={i} style={s.itemRow}>
                  <Text style={s.itemName} numberOfLines={1}>
                    {it.name}{it.quantity && it.quantity !== 1 ? `  ×${it.quantity}` : ""}
                  </Text>
                  <Text style={s.itemPrice}>{money(it.price, expense.currency)}</Text>
                </View>
              ))}
              <Text style={s.savedNote}>✓ Saved to history</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 18 }}
          data={history}
          keyExtractor={(e) => e.scannedAt}
          ListHeaderComponent={
            history.length > 0 ? (
              <View style={[s.card, s.summary]}>
                <Text style={s.mutedLeft}>Total tracked spend</Text>
                <Text style={s.summaryTotal}>{money(totalSpend, mainCurrency)}</Text>
                <View style={s.catRow}>
                  {byCategory.slice(0, 4).map(([cat, amt]) => (
                    <View key={cat} style={s.catPill}>
                      <Text style={s.catText}>
                        {CATEGORY_ICONS[cat] ?? "🧾"} {money(amt, mainCurrency)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Text style={{ fontSize: 40 }}>🗂️</Text>
              <Text style={s.emptyTitle}>No scans yet</Text>
              <Text style={s.muted}>Scanned receipts appear here with a running spend summary.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={s.merchant}>{item.merchant || "Unknown"}</Text>
                  <Text style={s.mutedLeft}>
                    {CATEGORY_ICONS[item.category] ?? "🧾"} {item.category} · {item.date || item.scannedAt.slice(0, 10)}
                  </Text>
                </View>
                <Text style={s.total}>{money(item.total, item.currency)}</Text>
                <TouchableOpacity style={s.del} onPress={() => removeEntry(item.scannedAt)}>
                  <Text style={{ color: "#96a0b5", fontSize: 15 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0f17" },
  header: { alignItems: "center", marginTop: 14, marginBottom: 12 },
  title: { color: "#e8ecf4", fontSize: 24, fontWeight: "800" },
  tagline: { color: "#96a0b5", fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: "row", marginHorizontal: 18, gap: 10 },
  tab: { flex: 1, borderWidth: 1, borderColor: "#232d42", borderRadius: 999, padding: 10, alignItems: "center" },
  tabOn: { backgroundColor: "#5b8cff", borderColor: "#5b8cff" },
  tabText: { color: "#96a0b5", fontWeight: "600" },
  tabTextOn: { color: "#fff" },
  errBanner: { backgroundColor: "rgba(248,113,113,.12)", borderWidth: 1, borderColor: "rgba(248,113,113,.4)", borderRadius: 10, margin: 18, marginBottom: 0, padding: 12 },
  errText: { color: "#f87171", fontSize: 13 },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  big: { flex: 1, backgroundColor: "#5b8cff", borderRadius: 14, padding: 22, alignItems: "center" },
  bigAlt: { backgroundColor: "#141b2b", borderWidth: 1, borderColor: "#232d42" },
  bigText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  preview: { width: "100%", height: 180, borderRadius: 12, marginBottom: 14, backgroundColor: "#141b2b" },
  center: { alignItems: "center", gap: 8, marginVertical: 12 },
  emptyState: { alignItems: "center", gap: 6, paddingVertical: 30, paddingHorizontal: 24 },
  emptyTitle: { color: "#e8ecf4", fontWeight: "700", fontSize: 16 },
  card: { backgroundColor: "#141b2b", borderWidth: 1, borderColor: "#232d42", borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHead: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  merchant: { color: "#e8ecf4", fontSize: 17, fontWeight: "700" },
  muted: { color: "#96a0b5", fontSize: 13, marginTop: 2, textAlign: "center" },
  mutedLeft: { color: "#96a0b5", fontSize: 13, marginTop: 2 },
  total: { color: "#5b8cff", fontSize: 20, fontWeight: "800" },
  del: { padding: 4, marginLeft: 2 },
  divider: { borderTopWidth: 1, borderTopColor: "#232d42", marginTop: 12 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 9 },
  itemName: { color: "#e8ecf4", flex: 1, marginRight: 10, fontSize: 13 },
  itemPrice: { color: "#96a0b5", fontSize: 13 },
  savedNote: { color: "#34d399", fontSize: 12, marginTop: 12, fontWeight: "600" },
  summary: { backgroundColor: "#10182b", borderColor: "#2b3a5c" },
  summaryTotal: { color: "#e8ecf4", fontSize: 30, fontWeight: "800", marginVertical: 4 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  catPill: { backgroundColor: "rgba(91,140,255,.12)", borderWidth: 1, borderColor: "rgba(91,140,255,.3)", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
  catText: { color: "#5b8cff", fontSize: 12, fontWeight: "600" },
});
