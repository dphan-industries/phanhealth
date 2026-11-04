import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UITheme, withAlpha } from "../constants/uiThemes";

type Props = {
  runCoins: number;
  onCancel: () => void;
  onConfirm: () => void;
  theme: UITheme;
};

export function QuitRunConfirmOverlay({
  runCoins,
  onCancel,
  onConfirm,
  theme,
}: Readonly<Props>) {
  const message =
    runCoins <= 0
      ? "You haven’t earned any gold this run yet. Quit anyway?"
      : runCoins === 1
        ? "You’ll lose 1 gold from this run if you leave now."
        : `You’ll lose ${runCoins} gold from this run if you leave now.`;

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: withAlpha(theme.overlayBg, 0.78) },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: withAlpha(theme.panelBg, 0.96),
            borderColor: withAlpha(theme.accent, 0.25),
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          QUIT THIS RUN?
        </Text>

        <View
          style={[
            styles.divider,
            { backgroundColor: withAlpha(theme.accent, 0.15) },
          ]}
        />

        <Text style={[styles.message, { color: theme.textFaint }]}>
          {message}
        </Text>

        <View style={styles.row}>
          <TouchableOpacity onPress={onCancel} activeOpacity={0.8}>
            <View
              style={[
                styles.btn,
                {
                  backgroundColor: theme.buttonBg,
                  borderColor: theme.buttonBorder,
                },
              ]}
            >
              <Text style={[styles.btnText, { color: theme.buttonText }]}>
                CANCEL
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onConfirm} activeOpacity={0.8}>
            <View
              style={[
                styles.btn,
                {
                  backgroundColor: withAlpha(theme.accent, 0.18),
                  borderColor: withAlpha(theme.accent, 0.55),
                },
              ]}
            >
              <Text style={[styles.btnText, { color: theme.textPrimary }]}>
                QUIT
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 1,
    width: 300,
  },
  title: {
    fontSize: 22,
    letterSpacing: 3,
    fontFamily: "Orbitron_900Black",
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 14,
  },
  message: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 18,
    fontFamily: "Audiowide_400Regular",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 110,
    alignItems: "center",
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "Orbitron_900Black",
  },
});
