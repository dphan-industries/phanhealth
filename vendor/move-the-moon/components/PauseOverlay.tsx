import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UITheme, withAlpha } from "../constants/uiThemes";

type Props = {
  sfxMuted: boolean;
  musicMuted: boolean;
  onResume: () => void;
  onMenu: () => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  theme: UITheme;
};

export function PauseOverlay({
  sfxMuted,
  musicMuted,
  onResume,
  onMenu,
  onToggleSfx,
  onToggleMusic,
  theme,
}: Readonly<Props>) {
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>PAUSED</Text>
        <View
          style={[
            styles.divider,
            { backgroundColor: withAlpha(theme.accent, 0.15) },
          ]}
        />

        <View style={styles.audioRow}>
          <TouchableOpacity
            onPress={onToggleMusic}
            activeOpacity={0.7}
            style={styles.audioBtn}
          >
            <Ionicons
              name={musicMuted ? "volume-mute" : "volume-high"}
              size={28}
              color={
                musicMuted
                  ? withAlpha(theme.textPrimary, 0.3)
                  : withAlpha(theme.accent, 0.95)
              }
            />
            <Text
              style={[
                styles.audioLabel,
                {
                  color: musicMuted
                    ? withAlpha(theme.textPrimary, 0.3)
                    : withAlpha(theme.accent, 0.95),
                },
              ]}
            >
              MUSIC
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.audioDivider,
              { backgroundColor: withAlpha(theme.accent, 0.15) },
            ]}
          />

          <TouchableOpacity
            onPress={onToggleSfx}
            activeOpacity={0.7}
            style={styles.audioBtn}
          >
            <Ionicons
              name={sfxMuted ? "volume-off" : "musical-note"}
              size={28}
              color={
                sfxMuted
                  ? withAlpha(theme.textPrimary, 0.3)
                  : withAlpha(theme.accent, 0.95)
              }
            />
            <Text
              style={[
                styles.audioLabel,
                {
                  color: sfxMuted
                    ? withAlpha(theme.textPrimary, 0.3)
                    : withAlpha(theme.accent, 0.95),
                },
              ]}
            >
              SFX
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: withAlpha(theme.accent, 0.15) },
          ]}
        />

        <View style={styles.row}>
          <TouchableOpacity onPress={onResume} activeOpacity={0.8}>
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
                RESUME
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onMenu} activeOpacity={0.8}>
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
                QUIT RUN
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
    fontSize: 24,
    letterSpacing: 4,
    fontFamily: "Orbitron_900Black",
    marginBottom: 4,
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 14,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  audioBtn: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  audioDivider: {
    width: 1,
    height: 40,
  },
  audioLabel: {
    fontSize: 9,
    letterSpacing: 2,
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
    minWidth: 90,
    alignItems: "center",
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "Orbitron_900Black",
  },
});
