import React from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UITheme, withAlpha } from "../constants/uiThemes";

const { height } = Dimensions.get("window");

type Props = {
  highScore: number;
  tapPromptOpacity: Animated.Value;
  onPlay: () => void;
  onShop: () => void;
  onLeaderboard: () => void;
  theme: UITheme;
};

export function MenuScreen({
  highScore,
  tapPromptOpacity,
  onPlay,
  onShop,
  onLeaderboard,
  theme,
}: Readonly<Props>) {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.titleWrap}>
        <Text style={[styles.titleLine1, { color: theme.titleSub }]}>
          MOVE THE
        </Text>
        <Text
          style={[
            styles.titleLine2,
            {
              color: theme.titleMain,
              textShadowColor: withAlpha(theme.titleGlow, 0.95),
            },
          ]}
        >
          MOON
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.bottomSection}>
        {highScore > 0 && (
          <View
            style={[
              styles.bestScoreDisplay,
              {
                backgroundColor: withAlpha(theme.coin, 0.08),
                borderColor: withAlpha(theme.coin, 0.3),
              },
            ]}
          >
            <Text
              style={[
                styles.bestScoreLabel,
                { color: withAlpha(theme.coin, 0.75) },
              ]}
            >
              BEST SCORE
            </Text>
            <Text style={[styles.bestScoreValue, { color: theme.coin }]}>
              {highScore}
            </Text>
          </View>
        )}

        <View style={styles.buttonsRow}>
          <TouchableOpacity onPress={onPlay} activeOpacity={0.8}>
            <View
              style={[
                styles.btn,
                {
                  backgroundColor: theme.buttonBg,
                  borderColor: theme.buttonBorder,
                  shadowColor: theme.accent,
                },
              ]}
            >
              <Text style={[styles.btnText, { color: theme.buttonText }]}>
                PLAY
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onShop} activeOpacity={0.8}>
            <View
              style={[
                styles.btn,
                {
                  backgroundColor: theme.buttonBg,
                  borderColor: theme.buttonBorder,
                  shadowColor: theme.accent,
                },
              ]}
            >
              <Text style={[styles.btnText, { color: theme.buttonText }]}>
                SHOP
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLeaderboard} activeOpacity={0.8}>
            <View
              style={[
                styles.btn,
                {
                  backgroundColor: theme.buttonBg,
                  borderColor: theme.buttonBorder,
                  shadowColor: theme.accent,
                },
              ]}
            >
              <Text style={[styles.btnText, { color: theme.buttonText }]}>
                SCORES
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Animated.Text
          style={[
            styles.tapHint,
            {
              opacity: tapPromptOpacity,
              color: withAlpha(theme.textPrimary, 0.28),
            },
          ]}
        >
          tap moon to play · drag to move
        </Animated.Text>
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
    alignItems: "center",
  },
  titleWrap: {
    alignItems: "center",
    marginTop: height * 0.08,
  },
  titleLine1: {
    fontSize: 14,
    letterSpacing: 8,
    fontFamily: "Audiowide_400Regular",
  },
  titleLine2: {
    fontSize: 58,
    letterSpacing: 10,
    marginTop: -4,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    fontFamily: "Orbitron_900Black",
  },
  bottomSection: {
    alignItems: "center",
    marginBottom: height * 0.08,
    gap: 16,
  },
  bestScoreDisplay: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  bestScoreLabel: {
    fontSize: 11,
    letterSpacing: 4,
    fontFamily: "Audiowide_400Regular",
  },
  bestScoreValue: {
    fontSize: 48,
    letterSpacing: 4,
    marginTop: -4,
    fontFamily: "Orbitron_900Black",
  },
  buttonsRow: {
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "Orbitron_900Black",
  },
  tapHint: {
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: "Audiowide_400Regular",
  },
});
