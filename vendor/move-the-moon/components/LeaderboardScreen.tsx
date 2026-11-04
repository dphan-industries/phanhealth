import React from "react";
import {
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
  topScores: number[];
  onBack: () => void;
  theme: UITheme;
};

function getMedalDisplayColor(
  medal: { label: string; color: string } | null | undefined,
  theme: UITheme,
): string {
  if (!medal) return theme.accent;

  switch (medal.label.toUpperCase()) {
    case "DIAMOND":
      return "#4E8DCC";
    case "PLATINUM":
      return "#6E7F91";
    case "GOLD":
      return "#B88718";
    case "GRANDMASTER":
      return "#7A3DB8";
    case "MASTER":
      return "#B14D6E";
    case "SILVER":
      return "#7A8796";
    case "BRONZE":
      return "#9A6842";
    default:
      return medal.color;
  }
}

export function LeaderboardScreen({
  topScores,
  onBack,
  theme,
}: Readonly<Props>) {
  const visibleScores = topScores.slice(0, 3);

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: withAlpha(theme.overlayBg, 0.92) },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: withAlpha(theme.panelBg, 0.98),
            borderColor: withAlpha(theme.accent, 0.24),
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          TOP SCORES
        </Text>

        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Your best three runs
        </Text>

        <View
          style={[
            styles.divider,
            { backgroundColor: withAlpha(theme.accent, 0.16) },
          ]}
        />

        {visibleScores.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textFaint }]}>
            No scores yet.{"\n"}Play your first game!
          </Text>
        ) : (
          <View style={styles.rows}>
            {visibleScores.map((score, index) => {
              const medal = getMedal(score);
              const isFirst = index === 0;
              const medalDisplayColor = getMedalDisplayColor(medal, theme);
              return (
                <View
                  key={`${score}-${index}`}
                  style={[
                    styles.row,
                    {
                      backgroundColor: withAlpha(
                        theme.buttonBg,
                        isFirst ? 0.9 : 0.78,
                      ),
                      borderColor: withAlpha(
                        isFirst ? theme.accent : theme.buttonBorder,
                        isFirst ? 0.3 : 0.18,
                      ),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor: withAlpha(theme.panelBg, 0.94),
                        borderColor: medal
                          ? withAlpha(medal.color, 0.3)
                          : withAlpha(theme.accent, 0.22),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankBadgeText,
                        { color: theme.textPrimary },
                      ]}
                    >
                      #{index + 1}
                    </Text>
                  </View>

                  <View style={styles.scoreBlock}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      style={[
                        styles.rowScore,
                        { color: theme.textPrimary },
                        isFirst && styles.firstScore,
                      ]}
                    >
                      {score}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.medalChip,
                      {
                        backgroundColor: medal
                          ? withAlpha(medalDisplayColor, 0.14)
                          : withAlpha(theme.accent, 0.12),
                        borderColor: medal
                          ? withAlpha(medalDisplayColor, 0.3)
                          : withAlpha(theme.accent, 0.24),
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      style={[
                        styles.medalChipText,
                        { color: medalDisplayColor },
                      ]}
                    >
                      {medal ? medal.label : "UNRANKED"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View
          style={[
            styles.divider,
            { backgroundColor: withAlpha(theme.accent, 0.16) },
          ]}
        />

        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.85}
          style={styles.backBtnWrap}
        >
          <View
            style={[
              styles.backBtn,
              {
                backgroundColor: theme.buttonBg,
                borderColor: withAlpha(theme.buttonBorder, 0.9),
              },
            ]}
          >
            <Text style={[styles.backBtnText, { color: theme.buttonText }]}>
              BACK
            </Text>
          </View>
        </TouchableOpacity>
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
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    width: width * 0.84,
  },
  title: {
    fontSize: 24,
    letterSpacing: 4,
    fontFamily: "Orbitron_900Black",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "Audiowide_400Regular",
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 14,
  },
  rows: {
    width: "100%",
  },
  row: {
    width: "100%",
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rankBadge: {
    width: 54,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  rankBadgeText: {
    fontSize: 15,
    letterSpacing: 1,
    fontFamily: "Orbitron_700Bold",
  },
  scoreBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  rowScore: {
    fontSize: 24,
    letterSpacing: 1.5,
    fontFamily: "Orbitron_900Black",
    textAlign: "center",
    includeFontPadding: false,
  },
  firstScore: {
    fontSize: 30,
  },
  medalChip: {
    width: 84,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  medalChipText: {
    fontSize: 9,
    letterSpacing: 1.1,
    fontFamily: "Orbitron_700Bold",
    textAlign: "center",
    includeFontPadding: false,
  },
  empty: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 24,
    paddingVertical: 20,
    fontFamily: "Audiowide_400Regular",
  },
  backBtnWrap: {
    width: "100%",
    marginTop: 4,
  },
  backBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "Orbitron_900Black",
  },
});
