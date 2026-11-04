import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UITheme, withAlpha } from "../constants/uiThemes";

type Props = {
  score: number;
  highScore: number;
  onPause: () => void;
  isPeaceMode?: boolean;
  theme: UITheme;
};

export function Hud({
  score,
  highScore,
  onPause,
  isPeaceMode = false,
  theme,
}: Readonly<Props>) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {!isPeaceMode && (
        <>
          <View style={styles.scoreWrap} pointerEvents="none">
            <Text style={[styles.score, { color: theme.textPrimary }]}>
              {score}
            </Text>
            <Text style={[styles.scoreLabel, { color: theme.textFaint }]}>
              SCORE
            </Text>
          </View>

          <View style={styles.highScoreWrap} pointerEvents="none">
            <Text style={[styles.highScoreLabel, { color: theme.textFaint }]}>
              BEST
            </Text>
            <Text style={[styles.highScoreText, { color: theme.textMuted }]}>
              {highScore}
            </Text>
          </View>
        </>
      )}

      {isPeaceMode && (
        <View style={styles.peaceLabelWrap} pointerEvents="none">
          <Text style={[styles.peaceLabel, { color: theme.textPrimary }]}>
            PEACE MODE
          </Text>
        </View>
      )}

      <View style={styles.hudControls} pointerEvents="auto">
        <TouchableOpacity
          onPress={onPause}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View
            style={[
              styles.iconBtn,
              {
                backgroundColor: withAlpha(theme.panelBg, 0.5),
                borderColor: withAlpha(theme.accent, 0.22),
              },
            ]}
          >
            <Ionicons
              name="pause"
              size={20}
              color={withAlpha(theme.accent, 0.95)}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scoreWrap: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    alignItems: "center",
  },
  score: {
    fontSize: 48,
    letterSpacing: 2,
    fontFamily: "Orbitron_900Black",
  },
  scoreLabel: {
    fontSize: 11,
    letterSpacing: 3,
    marginTop: -6,
    fontFamily: "Audiowide_400Regular",
  },
  highScoreWrap: {
    position: "absolute",
    top: 50,
    left: 20,
    alignItems: "flex-start",
  },
  highScoreLabel: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 2,
    fontFamily: "Audiowide_400Regular",
  },
  highScoreText: {
    fontSize: 16,
    fontFamily: "Orbitron_700Bold",
  },
  peaceLabelWrap: {
    position: "absolute",
    top: 58,
    alignSelf: "center",
    alignItems: "center",
  },
  peaceLabel: {
    fontSize: 14,
    letterSpacing: 3,
    fontFamily: "Audiowide_400Regular",
  },
  hudControls: {
    position: "absolute",
    top: 44,
    right: 12,
    flexDirection: "row",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
