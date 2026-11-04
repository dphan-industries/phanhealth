import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getMedal } from "../constants/medals";
import { UITheme, withAlpha } from "../constants/uiThemes";

const { width } = Dimensions.get("window");

type Props = {
  score: number;
  highScore: number;
  coinsEarned: number;
  hasRevivedAlready: boolean;
  hasClaimedDoubleCoins: boolean;
  isReviveReady: boolean;
  isDoubleCoinsReady: boolean;
  isAdInProgress: boolean;
  onRevive: () => void;
  onDoubleCoins: () => void;
  onReplay: () => void;
  onMenu: () => void;
  theme: UITheme;
};

function AdBadge({ theme }: Readonly<{ theme: UITheme }>) {
  return (
    <View
      style={[
        styles.adBadge,
        {
          backgroundColor: withAlpha(theme.accent, 0.12),
          borderColor: withAlpha(theme.accent, 0.4),
        },
      ]}
    >
      <Text style={[styles.adBadgeText, { color: theme.accent }]}>AD</Text>
    </View>
  );
}

export function GameOverScreen({
  score,
  highScore,
  coinsEarned,
  hasRevivedAlready,
  hasClaimedDoubleCoins,
  isReviveReady,
  isDoubleCoinsReady,
  isAdInProgress,
  onRevive,
  onDoubleCoins,
  onReplay,
  onMenu,
  theme,
}: Readonly<Props>) {
  const medal = getMedal(score);

  const showRevive = false;
  const showDoubleCoins = false;

  const reviveDisabled = !isReviveReady || isAdInProgress;
  const doubleCoinsDisabled = !isDoubleCoinsReady || isAdInProgress;
  const replayDisabled = isAdInProgress;
  const menuDisabled = isAdInProgress;

  const displayedCoins = hasClaimedDoubleCoins ? coinsEarned * 2 : coinsEarned;

  const helperText = hasClaimedDoubleCoins
    ? `All ad rewards used for this run. Final reward: ${displayedCoins} coins.`
    : hasRevivedAlready
      ? "Revive used. You can still watch an ad to double your coins."
      : "Offline edition. Replay or return to the menu.";

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: withAlpha(theme.overlayBg, 0.55) },
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
          GAME OVER
        </Text>

        <View
          style={[
            styles.divider,
            { backgroundColor: withAlpha(theme.accent, 0.15) },
          ]}
        />

        <View style={styles.medalWrap}>
          <Text style={styles.medalEmoji}>{medal ? medal.emoji : "💫"}</Text>
          <Text
            style={[
              styles.medalLabel,
              { color: medal ? medal.color : theme.textPrimary },
            ]}
          >
            {medal ? medal.label : "KEEP GOING"}
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreValue, { color: theme.textPrimary }]}>
              {score}
            </Text>
            <Text style={[styles.scoreLabel, { color: theme.textFaint }]}>
              SCORE
            </Text>
          </View>

          <View
            style={[
              styles.scoreDivider,
              { backgroundColor: withAlpha(theme.accent, 0.15) },
            ]}
          />

          <View style={styles.scoreBox}>
            <Text style={[styles.scoreValue, { color: theme.textPrimary }]}>
              {highScore}
            </Text>
            <Text style={[styles.scoreLabel, { color: theme.textFaint }]}>
              BEST
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.coinEarned,
            { backgroundColor: withAlpha(theme.coin, 0.08) },
          ]}
        >
          <Text style={[styles.coinEarnedText, { color: theme.coin }]}>
            {hasClaimedDoubleCoins
              ? `🪙 ${coinsEarned} x 2 = ${displayedCoins} coins earned`
              : `🪙 ${coinsEarned} coins earned`}
          </Text>
        </View>

        {showRevive && (
          <TouchableOpacity
            onPress={onRevive}
            activeOpacity={0.85}
            disabled={reviveDisabled}
            style={styles.primaryButtonWrap}
          >
            <View
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: reviveDisabled
                    ? withAlpha(theme.buttonBg, 0.45)
                    : theme.buttonBg,
                  borderColor: reviveDisabled
                    ? withAlpha(theme.buttonBorder, 0.45)
                    : theme.buttonBorder,
                },
              ]}
            >
              {isAdInProgress ? (
                <ActivityIndicator />
              ) : (
                <View style={styles.buttonContentRow}>
                  <Text
                    style={[
                      styles.primaryBtnText,
                      {
                        color: reviveDisabled
                          ? withAlpha(theme.buttonText, 0.6)
                          : theme.buttonText,
                      },
                    ]}
                  >
                    {isReviveReady ? "REVIVE" : "LOADING REVIVE..."}
                  </Text>
                  <AdBadge theme={theme} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {showDoubleCoins && (
          <TouchableOpacity
            onPress={onDoubleCoins}
            activeOpacity={0.85}
            disabled={doubleCoinsDisabled}
            style={styles.primaryButtonWrap}
          >
            <View
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: doubleCoinsDisabled
                    ? withAlpha(theme.coin, 0.16)
                    : withAlpha(theme.coin, 0.22),
                  borderColor: doubleCoinsDisabled
                    ? withAlpha(theme.coin, 0.35)
                    : withAlpha(theme.coin, 0.9),
                },
              ]}
            >
              {isAdInProgress ? (
                <ActivityIndicator />
              ) : (
                <View style={styles.buttonContentRow}>
                  <Text
                    style={[
                      styles.primaryBtnText,
                      {
                        color: doubleCoinsDisabled
                          ? withAlpha(theme.textPrimary, 0.55)
                          : theme.textPrimary,
                      },
                    ]}
                  >
                    {isDoubleCoinsReady ? "x2 COINS" : "LOADING x2 COINS..."}
                  </Text>
                  <AdBadge theme={theme} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        <Text style={[styles.helperText, { color: theme.textFaint }]}>
          {helperText}
        </Text>

        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            onPress={onReplay}
            activeOpacity={0.85}
            disabled={replayDisabled}
            style={styles.bottomButtonHalf}
          >
            <View
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: replayDisabled
                    ? withAlpha(theme.accent, 0.12)
                    : withAlpha(theme.accent, 0.18),
                  borderColor: replayDisabled
                    ? withAlpha(theme.accent, 0.25)
                    : withAlpha(theme.accent, 0.65),
                },
              ]}
            >
              <Text
                style={[
                  styles.secondaryBtnText,
                  {
                    color: replayDisabled
                      ? withAlpha(theme.textPrimary, 0.5)
                      : theme.textPrimary,
                  },
                ]}
              >
                REPLAY
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onMenu}
            activeOpacity={0.85}
            disabled={menuDisabled}
            style={styles.bottomButtonHalf}
          >
            <View
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: menuDisabled
                    ? withAlpha(theme.buttonBg, 0.35)
                    : withAlpha(theme.buttonBg, 0.9),
                  borderColor: menuDisabled
                    ? withAlpha(theme.buttonBorder, 0.35)
                    : theme.buttonBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.secondaryBtnText,
                  {
                    color: menuDisabled
                      ? withAlpha(theme.buttonText, 0.5)
                      : theme.buttonText,
                  },
                ]}
              >
                MENU
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
    width: width * 0.84,
  },
  title: {
    fontSize: 24,
    letterSpacing: 4,
    fontFamily: "Orbitron_900Black",
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 14,
  },
  medalWrap: {
    alignItems: "center",
    marginBottom: 10,
  },
  medalEmoji: {
    fontSize: 52,
  },
  medalLabel: {
    fontSize: 11,
    letterSpacing: 4,
    marginTop: 4,
    textAlign: "center",
    fontFamily: "Audiowide_400Regular",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
    justifyContent: "center",
  },
  scoreBox: {
    alignItems: "center",
    flex: 1,
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: "Orbitron_900Black",
  },
  scoreLabel: {
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 2,
    fontFamily: "Audiowide_400Regular",
  },
  scoreDivider: {
    width: 1,
    height: 40,
  },
  coinEarned: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 14,
  },
  coinEarnedText: {
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: "Audiowide_400Regular",
    textAlign: "center",
  },
  primaryButtonWrap: {
    width: "100%",
    marginBottom: 10,
  },
  primaryBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  primaryBtnText: {
    fontSize: 12,
    letterSpacing: 2,
    textAlign: "center",
    fontFamily: "Orbitron_900Black",
  },
  adBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adBadgeText: {
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: "Orbitron_900Black",
  },
  helperText: {
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 12,
    fontFamily: "Audiowide_400Regular",
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 2,
  },
  bottomButtonHalf: {
    flex: 1,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  secondaryBtnText: {
    fontSize: 12,
    letterSpacing: 2,
    textAlign: "center",
    fontFamily: "Orbitron_900Black",
  },
});
