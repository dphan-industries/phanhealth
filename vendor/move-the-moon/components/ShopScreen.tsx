import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Skin, SKIN_ASSETS, SkinType } from "../constants/skins";
import { SoundEffectOption } from "../constants/sounds";
import { UITheme, withAlpha } from "../constants/uiThemes";

const { width, height } = Dimensions.get("window");

type ShopTab = SkinType | "sound";

type Props = {
  skins: Skin[];
  sounds: SoundEffectOption[];
  coins: number;
  shopTab: ShopTab;
  activeEarth: string;
  activeMoon: string;
  activeBg: string;
  activeSound: string;
  onSetTab: (tab: ShopTab) => void;
  onBuySkin: (skinId: string) => void;
  onEquipSkin: (skinId: string, type: SkinType) => void;
  onBuySound: (soundId: string) => void;
  onEquipSound: (soundId: string) => void;
  onBack: () => void;
  theme: UITheme;
};

const CARD_WIDTH = width * 0.9;

export function ShopScreen({
  skins,
  sounds,
  coins,
  shopTab,
  activeEarth,
  activeMoon,
  activeBg,
  activeSound,
  onSetTab,
  onBuySkin,
  onEquipSkin,
  onBuySound,
  onEquipSound,
  onBack,
  theme,
}: Readonly<Props>) {
  const isSoundTab = shopTab === "sound";

  const groupedSkins: Record<SkinType, Skin[]> = {
    earth: skins.filter((skin) => skin.type === "earth"),
    moon: skins.filter((skin) => skin.type === "moon"),
    bg: skins.filter((skin) => skin.type === "bg"),
  };

  const filteredSkins: Skin[] = isSoundTab
    ? []
    : groupedSkins[shopTab as SkinType];

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
            borderColor: withAlpha(theme.accent, 0.25),
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>SHOP</Text>
          <View
            style={[
              styles.coinBadge,
              {
                backgroundColor: withAlpha(theme.coin, 0.1),
                borderColor: withAlpha(theme.coin, 0.3),
              },
            ]}
          >
            <Text style={[styles.coinText, { color: theme.coin }]}>
              🪙 {coins}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: withAlpha(theme.accent, 0.15) },
          ]}
        />

        <View style={styles.tabs}>
          {(["earth", "moon", "bg", "sound"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => onSetTab(tab)}
              activeOpacity={0.8}
              style={styles.tabButton}
            >
              <View
                style={[
                  styles.tab,
                  {
                    borderColor: withAlpha(theme.accent, 0.2),
                    backgroundColor: withAlpha(theme.buttonBg, 0.55),
                  },
                  shopTab === tab && {
                    borderColor: withAlpha(theme.accent, 0.8),
                    backgroundColor: withAlpha(theme.accent, 0.24),
                  },
                ]}
              >
                <Text style={styles.tabEmoji}>
                  {tab === "earth"
                    ? "🌍"
                    : tab === "moon"
                      ? "🌙"
                      : tab === "bg"
                        ? "🌌"
                        : "🔊"}
                </Text>

                <Text style={[styles.tabText, { color: theme.textMuted }]}>
                  {tab === "earth"
                    ? "EARTH"
                    : tab === "moon"
                      ? "MOON"
                      : tab === "bg"
                        ? "SPACE"
                        : "SOUND"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.grid} showsVerticalScrollIndicator={false}>
          <View style={styles.gridInner}>
            {isSoundTab
              ? sounds.map((sound, index) => {
                  const isActive = activeSound === sound.id;

                  return (
                    <TouchableOpacity
                      key={sound.id}
                      style={[
                        styles.item,
                        index % 3 !== 2 && styles.itemSpacing,
                        {
                          backgroundColor: withAlpha(theme.buttonBg, 0.65),
                          borderColor: withAlpha(theme.accent, 0.15),
                        },
                        isActive && {
                          borderColor: withAlpha(theme.success, 0.78),
                          backgroundColor: withAlpha(theme.success, 0.14),
                        },
                      ]}
                      onPress={() => {
                        if (sound.owned) onEquipSound(sound.id);
                        else onBuySound(sound.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.soundPreview,
                          {
                            backgroundColor: withAlpha(theme.accent, 0.12),
                            borderColor: withAlpha(theme.accent, 0.25),
                          },
                        ]}
                      >
                        <Text style={styles.soundPreviewEmoji}>
                          {sound.icon}
                        </Text>
                      </View>

                      <Text
                        style={[styles.itemName, { color: theme.textPrimary }]}
                      >
                        {sound.name}
                      </Text>

                      {sound.owned ? (
                        <Text
                          style={[
                            styles.itemStatus,
                            {
                              color: isActive
                                ? theme.success
                                : withAlpha(theme.textPrimary, 0.42),
                            },
                          ]}
                        >
                          {isActive ? "✓ ON" : "EQUIP"}
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.itemCost,
                            {
                              color:
                                coins >= sound.cost ? theme.coin : theme.danger,
                            },
                          ]}
                        >
                          🪙 {sound.cost}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })
              : filteredSkins.map((skin, index) => {
                  const isActive =
                    (skin.type === "earth" && activeEarth === skin.id) ||
                    (skin.type === "moon" && activeMoon === skin.id) ||
                    (skin.type === "bg" && activeBg === skin.id);

                  const skinAsset =
                    skin.type !== "bg" ? SKIN_ASSETS[skin.id] : undefined;

                  return (
                    <TouchableOpacity
                      key={skin.id}
                      style={[
                        styles.item,
                        index % 3 !== 2 && styles.itemSpacing,
                        {
                          backgroundColor: withAlpha(theme.buttonBg, 0.65),
                          borderColor: withAlpha(theme.accent, 0.15),
                        },
                        isActive && {
                          borderColor: withAlpha(theme.success, 0.78),
                          backgroundColor: withAlpha(theme.success, 0.14),
                        },
                      ]}
                      onPress={() => {
                        if (skin.owned) onEquipSkin(skin.id, skin.type);
                        else onBuySkin(skin.id);
                      }}
                      activeOpacity={0.8}
                    >
                      {skinAsset ? (
                        <View
                          style={[
                            styles.planetPreviewFrame,
                            {
                              borderColor: withAlpha(theme.textPrimary, 0.15),
                            },
                          ]}
                        >
                          <Image
                            source={skinAsset}
                            style={styles.planetPreviewImage}
                            resizeMode="cover"
                          />
                        </View>
                      ) : skin.type === "bg" ? (
                        <View
                          style={[
                            styles.bgPreviewFrame,
                            {
                              backgroundColor: skin.color,
                              borderColor: withAlpha(theme.textPrimary, 0.15),
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.bgGlow,
                              {
                                backgroundColor: withAlpha(skin.color, 0.35),
                              },
                            ]}
                          />

                          <View style={[styles.northStar, styles.bgStarLg]}>
                            <View style={styles.northStarV} />
                            <View style={styles.northStarH} />
                            <View
                              style={[styles.northStarD, styles.northStarD1]}
                            />
                            <View
                              style={[styles.northStarD, styles.northStarD2]}
                            />
                            <View style={styles.northStarCore} />
                          </View>

                          <View
                            style={[styles.northStarSmall, styles.bgStarSm1]}
                          >
                            <View style={styles.northStarSmallV} />
                            <View style={styles.northStarSmallH} />
                            <View style={styles.northStarSmallCore} />
                          </View>

                          <View
                            style={[styles.northStarSmall, styles.bgStarSm2]}
                          >
                            <View style={styles.northStarSmallV} />
                            <View style={styles.northStarSmallH} />
                            <View style={styles.northStarSmallCore} />
                          </View>

                          <View
                            style={[styles.northStarSmall, styles.bgStarSm3]}
                          >
                            <View style={styles.northStarSmallV} />
                            <View style={styles.northStarSmallH} />
                            <View style={styles.northStarSmallCore} />
                          </View>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.skinPreview,
                            {
                              backgroundColor: skin.color,
                              borderColor: withAlpha(theme.textPrimary, 0.15),
                            },
                          ]}
                        />
                      )}

                      <Text
                        style={[styles.itemName, { color: theme.textPrimary }]}
                      >
                        {skin.name}
                      </Text>

                      {skin.owned ? (
                        <Text
                          style={[
                            styles.itemStatus,
                            {
                              color: isActive
                                ? theme.success
                                : withAlpha(theme.textPrimary, 0.42),
                            },
                          ]}
                        >
                          {isActive ? "✓ ON" : "EQUIP"}
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.itemCost,
                            {
                              color:
                                coins >= skin.cost ? theme.coin : theme.danger,
                            },
                          ]}
                        >
                          🪙 {skin.cost}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
          </View>
        </ScrollView>

        <View
          style={[
            styles.divider,
            { backgroundColor: withAlpha(theme.accent, 0.15) },
          ]}
        />

        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text
            style={[
              styles.backBtnText,
              { color: withAlpha(theme.accent, 0.95) },
            ]}
          >
            ← BACK
          </Text>
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
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderWidth: 1,
    width: CARD_WIDTH,
    maxHeight: height * 0.82,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    letterSpacing: 4,
    fontFamily: "Orbitron_900Black",
  },
  coinBadge: {
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  coinText: {
    fontSize: 14,
    fontFamily: "Orbitron_700Bold",
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 14,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tabButton: {
    width: "23.5%",
  },
  tab: {
    minHeight: 58,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
  },
  tabEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: "Audiowide_400Regular",
  },
  grid: {
    maxHeight: height * 0.42,
  },
  gridInner: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingBottom: 10,
  },
  item: {
    width: "31.5%",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 10,
  },
  itemSpacing: {
    marginRight: "2.75%",
  },
  skinPreview: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  planetPreviewFrame: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  planetPreviewImage: {
    width: "100%",
    height: "100%",
  },
  soundPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  soundPreviewEmoji: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 12,
    textAlign: "center",
    minHeight: 32,
    fontFamily: "Orbitron_700Bold",
  },
  itemStatus: {
    marginTop: 8,
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: "Audiowide_400Regular",
  },
  itemCost: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: "Orbitron_700Bold",
  },
  backBtn: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  backBtnText: {
    fontSize: 13,
    letterSpacing: 3,
    fontFamily: "Orbitron_700Bold",
  },
  bgPreviewFrame: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
    position: "relative",
  },

  bgGlow: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    top: 13,
    left: 13,
    opacity: 0.55,
  },

  northStar: {
    position: "absolute",
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  northStarV: {
    position: "absolute",
    width: 2,
    height: 16,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  northStarH: {
    position: "absolute",
    width: 16,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  northStarD: {
    position: "absolute",
    width: 12,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  northStarD1: {
    transform: [{ rotate: "45deg" }],
  },

  northStarD2: {
    transform: [{ rotate: "-45deg" }],
  },

  northStarCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,1)",
  },

  northStarSmall: {
    position: "absolute",
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  northStarSmallV: {
    position: "absolute",
    width: 1.5,
    height: 10,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  northStarSmallH: {
    position: "absolute",
    width: 10,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  northStarSmallCore: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,1)",
  },

  bgStarLg: {
    top: 10,
    right: 10,
  },

  bgStarSm1: {
    bottom: 10,
    left: 10,
  },

  bgStarSm2: {
    top: 15,
    left: 12,
  },

  bgStarSm3: {
    bottom: 14,
    right: 16,
  },
});
