import { QuitRunConfirmOverlay } from "@/components/QuitRunConfirmOverlay";
import { ReadyScreen } from "@/components/ReadyScreen";
import { Audiowide_400Regular } from "@expo-google-fonts/audiowide";
import {
  Orbitron_700Bold,
  Orbitron_900Black,
  useFonts,
} from "@expo-google-fonts/orbitron";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  BackHandler,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "../web-ads";
import { GameOverScreen } from "../components/GameOverScreen";
import { GameScreen } from "../components/GameScreen";
import { Hud } from "../components/Hud";
import { LeaderboardScreen } from "../components/LeaderboardScreen";
import { MenuScreen } from "../components/MenuScreen";
import { PauseOverlay } from "../components/PauseOverlay";
import { ShopScreen } from "../components/ShopScreen";
import { Starfield } from "../components/Starfield";
import { CENTER_X, CENTER_Y, EARTH_SIZE, MOON_RADIUS } from "../constants/game";
import { SKINS, SKIN_ASSETS, Skin, SkinType } from "../constants/skins";
import {
  SOUND_EFFECTS,
  SoundEffectId,
  SoundEffectOption,
} from "../constants/sounds";
import { getUITheme } from "../constants/uiThemes";
import { useAudio } from "../hooks/useAudio";
import { useGameLoop } from "../hooks/useGameLoop";
import {
  loadData,
  saveActiveSkin,
  saveActiveSound,
  saveCoins,
  saveSkins,
  saveSounds,
} from "../hooks/useStorage";
import { Asteroid, Particle, Screen } from "../types";

type ShopTab = "earth" | "moon" | "bg" | "sound";
type GameMode = "normal" | "peace";
type GamePhase = "ready" | "playing";

const ADS_MODE = process.env.EXPO_PUBLIC_ADS_MODE ?? "test";
const AD_DEBUG = process.env.EXPO_PUBLIC_AD_DEBUG === "true";

const USE_TEST_ADS = __DEV__ || ADS_MODE !== "live";

const REVIVE_AD_UNIT_ID = USE_TEST_ADS
  ? TestIds.REWARDED
  : "ca-app-pub-4267313412653900/4183300542";

const DOUBLE_COINS_AD_UNIT_ID = USE_TEST_ADS
  ? TestIds.REWARDED
  : "ca-app-pub-4267313412653900/2952536392";

const logAdDebug = (...args: unknown[]) => {
  if (__DEV__ || AD_DEBUG) {
    console.log(...args);
  }
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Orbitron_900Black,
    Orbitron_700Bold,
    Audiowide_400Regular,
  });

  const [screen, setScreen] = useState<Screen>("menu");
  const [gameMode, setGameMode] = useState<GameMode>("normal");
  const [moonAngle, setMoonAngle] = useState(180);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(true);
  const [musicMuted, setMusicMuted] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [topScores, setTopScores] = useState<number[]>([]);
  const [coins, setCoins] = useState(0);
  const [skins, setSkins] = useState<Skin[]>(SKINS);
  const [sounds, setSounds] = useState<SoundEffectOption[]>(SOUND_EFFECTS);
  const [activeEarth, setActiveEarth] = useState("default_earth");
  const [activeMoon, setActiveMoon] = useState("default_moon");
  const [activeBg, setActiveBg] = useState("default_bg");
  const [activeSound, setActiveSound] = useState<SoundEffectId>("classic_pops");
  const [shopTab, setShopTab] = useState<ShopTab>("earth");
  const [gamePhase, setGamePhase] = useState<GamePhase>("playing");
  const [appIsActive, setAppIsActive] = useState(true);
  const [showQuitRunConfirm, setShowQuitRunConfirm] = useState(false);
  const [runCoins, setRunCoins] = useState(0);
  const [hasRevivedAlready, setHasRevivedAlready] = useState(false);
  const [hasClaimedDoubleCoins, setHasClaimedDoubleCoins] = useState(false);
  const [isReviveReady, setIsReviveReady] = useState(false);
  const [isDoubleCoinsReady, setIsDoubleCoinsReady] = useState(false);
  const [isAdInProgress, setIsAdInProgress] = useState(false);

  const asteroidId = useRef(0);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const spawnIndexRef = useRef(0);
  const particleId = useRef(0);
  const moonAngleRef = useRef(180);
  const coinsRef = useRef(0);

  const earthHitAnim = useRef(new Animated.Value(0)).current;
  const screenShake = useRef(new Animated.Value(0)).current;
  const earthRotation = useRef(new Animated.Value(0)).current;
  const tapPromptOpacity = useRef(new Animated.Value(1)).current;
  const moonRotation = useRef(new Animated.Value(0)).current;

  const reviveAd = useMemo(
    () => RewardedAd.createForAdRequest(REVIVE_AD_UNIT_ID),
    [],
  );

  const doubleCoinsAd = useMemo(
    () => RewardedAd.createForAdRequest(DOUBLE_COINS_AD_UNIT_ID),
    [],
  );

  const { playPop, playGameOver, playClick, playBuy, playError } = useAudio(
    sfxMuted,
    musicMuted,
    paused,
    gameOver,
    activeSound,
    appIsActive,
  );

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    loadData().then(
      ({
        topScores,
        highScore,
        coins,
        ownedIds,
        activeSkins,
        ownedSoundIds,
        activeSound,
      }) => {
        setTopScores(topScores);
        setHighScore(highScore);
        setCoins(coins);
        coinsRef.current = coins;

        if (ownedIds.length) {
          setSkins((prev) =>
            prev.map((s) => ({
              ...s,
              owned: ownedIds.includes(s.id) || s.cost === 0,
            })),
          );
        }

        setSounds((prev) =>
          prev.map((sound) => ({
            ...sound,
            owned: ownedSoundIds.includes(sound.id) || sound.cost === 0,
          })),
        );

        if (activeSkins.earth) setActiveEarth(activeSkins.earth);
        if (activeSkins.moon) setActiveMoon(activeSkins.moon);
        if (activeSkins.bg) setActiveBg(activeSkins.bg);
        if (activeSound) setActiveSound(activeSound as SoundEffectId);
      },
    );
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(earthRotation, {
        toValue: 1,
        duration: 180000,
        useNativeDriver: true,
      }),
    ).start();
  }, [earthRotation]);

  useEffect(() => {
    if (screen !== "menu") return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(tapPromptOpacity, {
          toValue: 0.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(tapPromptOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => tapPromptOpacity.stopAnimation();
  }, [screen, tapPromptOpacity]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(moonRotation, {
        toValue: 1,
        duration: 90000,
        useNativeDriver: false,
      }),
    ).start();
  }, [moonRotation]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const isNowActive = nextState === "active";
        setAppIsActive(isNowActive);

        if (!isNowActive && screen === "game" && !gameOverRef.current) {
          setPaused(true);
          pausedRef.current = true;
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [screen]);

  useEffect(() => {
    const unsubscribeLoaded = reviveAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        logAdDebug("REVIVE AD LOADED");
        setIsReviveReady(true);
      },
    );

    const unsubscribeEarned = reviveAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        const preservedScore = scoreRef.current;

        gameOverRef.current = false;
        setGameOver(false);
        setPaused(false);
        pausedRef.current = false;
        setParticles([]);
        setAsteroids([]);
        setMoonAngle(180);
        moonAngleRef.current = 180;
        asteroidId.current = 0;
        spawnIndexRef.current = preservedScore;
        setGamePhase("ready");
        setHasRevivedAlready(true);
      },
    );

    const unsubscribeClosed = reviveAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsAdInProgress(false);
        setIsReviveReady(false);
        reviveAd.load();
      },
    );

    const unsubscribeError = reviveAd.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        logAdDebug("REVIVE AD ERROR:", error);

        setIsAdInProgress(false);
        setIsReviveReady(false);
        reviveAd.load();
      },
    );

    reviveAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [reviveAd]);

  useEffect(() => {
    const unsubscribeLoaded = doubleCoinsAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsDoubleCoinsReady(true);
      },
    );

    const unsubscribeEarned = doubleCoinsAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        if (hasClaimedDoubleCoins) return;
        setHasClaimedDoubleCoins(true);
      },
    );

    const unsubscribeClosed = doubleCoinsAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsAdInProgress(false);
        setIsDoubleCoinsReady(false);
        doubleCoinsAd.load();
      },
    );

    const unsubscribeError = doubleCoinsAd.addAdEventListener(
      AdEventType.ERROR,
      () => {
        setIsAdInProgress(false);
        setIsDoubleCoinsReady(false);
        doubleCoinsAd.load();
      },
    );

    doubleCoinsAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [doubleCoinsAd, hasClaimedDoubleCoins]);

  const triggerBlockEffect = (x: number, y: number) => {
    const newParticles: Particle[] = Array.from({ length: 6 }, () => {
      const anim = new Animated.Value(0);

      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      return {
        id: particleId.current++,
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        anim,
        color: Math.random() > 0.5 ? "#ffcc44" : "#ff8833",
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((n) => n.id === p.id)),
      );
    }, 600);
  };

  const triggerEarthHit = () => {
    playGameOver();

    Animated.sequence([
      Animated.timing(screenShake, {
        toValue: 12,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: -12,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(earthHitAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.timing(earthHitAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const bankGameOverReward = async () => {
    const finalRunReward = hasClaimedDoubleCoins ? runCoins * 2 : runCoins;

    if (finalRunReward <= 0) return;

    const newTotalCoins = coinsRef.current + finalRunReward;
    coinsRef.current = newTotalCoins;
    setCoins(newTotalCoins);
    await saveCoins(newTotalCoins);
  };

  const resetSharedState = () => {
    gameOverRef.current = false;
    setGameOver(false);
    setAsteroids([]);
    setScore(0);
    setRunCoins(0);
    setMoonAngle(180);
    moonAngleRef.current = 180;
    asteroidId.current = 0;
    spawnIndexRef.current = 0;
    scoreRef.current = 0;
    setParticles([]);
    setPaused(false);
    pausedRef.current = false;
    setHasRevivedAlready(false);
    setHasClaimedDoubleCoins(false);
    setShowQuitRunConfirm(false);
    setIsAdInProgress(false);
  };

  const startGame = () => {
    setGameMode("normal");
    resetSharedState();
    setGamePhase("ready");
    setScreen("game");
  };

  const startPeaceMode = () => {
    setGameMode("peace");
    resetSharedState();
    setGamePhase("ready");
    setScreen("game");
  };

  const resetGame = () => {
    setGameMode("normal");
    resetSharedState();
    setGamePhase("ready");
  };

  const handleRevivePress = () => {
    if (hasRevivedAlready || !isReviveReady || isAdInProgress) {
      return;
    }

    setIsAdInProgress(true);
    reviveAd.show();
  };

  const handleDoubleCoinsPress = () => {
    if (hasClaimedDoubleCoins || !isDoubleCoinsReady || isAdInProgress) {
      return;
    }

    setIsAdInProgress(true);
    doubleCoinsAd.show();
  };

  const buySkin = async (skinId: string) => {
    const skin = skins.find((s) => s.id === skinId);
    if (!skin || skin.owned) return;

    if (coinsRef.current < skin.cost) {
      playError();
      return;
    }

    playBuy();
    const newCoins = coinsRef.current - skin.cost;
    coinsRef.current = newCoins;
    setCoins(newCoins);
    saveCoins(newCoins);

    const newSkins = skins.map((s) =>
      s.id === skinId ? { ...s, owned: true } : s,
    );

    setSkins(newSkins);
    saveSkins(newSkins);
  };

  const buySound = async (soundId: string) => {
    const sound = sounds.find((s) => s.id === soundId);
    if (!sound || sound.owned) return;

    if (coinsRef.current < sound.cost) {
      playError();
      return;
    }

    playBuy();
    const newCoins = coinsRef.current - sound.cost;
    coinsRef.current = newCoins;
    setCoins(newCoins);
    saveCoins(newCoins);

    const newSounds = sounds.map((s) =>
      s.id === soundId ? { ...s, owned: true } : s,
    );

    setSounds(newSounds);
    saveSounds(newSounds);
  };

  const equipSkin = (skinId: string, type: SkinType) => {
    if (type === "earth") setActiveEarth(skinId);
    if (type === "moon") setActiveMoon(skinId);
    if (type === "bg") setActiveBg(skinId);

    saveActiveSkin(type, skinId);
  };

  const equipSound = (soundId: string) => {
    setActiveSound(soundId as SoundEffectId);
    saveActiveSound(soundId);
  };

  useGameLoop({
    screen,
    gameOver,
    paused,
    disableGameplay: gameMode === "peace",
    score,
    moonAngleRef,
    gameOverRef,
    pausedRef,
    scoreRef,
    asteroidId,
    spawnIndexRef,
    setAsteroids,
    setScore,
    setRunCoins,
    setGameOver,
    setTopScores,
    setHighScore,
    triggerBlockEffect,
    triggerEarthHit,
    playPop,
    gamePhase,
  });

  const { width } = Dimensions.get("window");

  const earthInteractive = screen === "menu" || gameMode === "peace";

  useEffect(() => {
    const onBackPress = () => {
      if (screen === "leaderboard") {
        playClick();
        setScreen("menu");
        return true;
      }

      if (screen === "shop") {
        playClick();
        setScreen("menu");
        return true;
      }

      if (gameOver) {
        playClick();
        void bankGameOverReward().then(() => {
          resetGame();
          setScreen("menu");
        });
        return true;
      }

      if (screen === "game" && paused) {
        playClick();
        setPaused(false);
        pausedRef.current = false;
        return true;
      }

      if (screen === "game" && !paused) {
        playClick();
        setPaused(true);
        pausedRef.current = true;
        return true;
      }

      if (screen === "menu") {
        return false;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [screen, paused, gameOver, playClick, runCoins, hasClaimedDoubleCoins]);

  // Orbit gestures must not start native browser text selection or image dragging.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = '#root, #root * { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none; } #root img { -webkit-user-drag: none; }';
    document.head.appendChild(style);
    const prevent = (event: Event) => event.preventDefault();
    document.addEventListener('selectstart', prevent);
    document.addEventListener('dragstart', prevent);
    return () => {
      style.remove();
      document.removeEventListener('selectstart', prevent);
      document.removeEventListener('dragstart', prevent);
    };
  }, []);

  // Web companion controls; preserve the original touch gameplay.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKey = (event: KeyboardEvent) => {
      if (screen !== 'game' || gameOverRef.current) return;
      if (event.key === 'Escape' || event.code === 'Space') {
        event.preventDefault(); setPaused(p => { pausedRef.current = !p; return !p; });
      }
      if (!pausedRef.current && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const angle = moonAngleRef.current + (event.key === 'ArrowRight' ? 12 : -12);
        moonAngleRef.current = angle; setMoonAngle(angle);
      }
    };
    const hide = () => { if (document.hidden && screen === 'game') { pausedRef.current = true; setPaused(true); } };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('visibilitychange', hide);
    return () => { window.removeEventListener('keydown', handleKey); document.removeEventListener('visibilitychange', hide); };
  }, [screen]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      if (screen !== "game" || gameOverRef.current || pausedRef.current) {
        return false;
      }

      const { pageX, pageY } = evt.nativeEvent;
      const inButtonArea = pageX > width - 180 && pageY < 120;

      const distEarth = Math.sqrt(
        (pageX - CENTER_X) ** 2 + (pageY - CENTER_Y) ** 2,
      );
      const inEarthArea = earthInteractive && distEarth < EARTH_SIZE / 2 + 18;

      return !inButtonArea && !inEarthArea;
    },
    onMoveShouldSetPanResponder: (evt) => {
      if (screen !== "game" || gameOverRef.current || pausedRef.current) {
        return false;
      }

      const { pageX, pageY } = evt.nativeEvent;
      const inButtonArea = pageX > width - 180 && pageY < 120;

      const distEarth = Math.sqrt(
        (pageX - CENTER_X) ** 2 + (pageY - CENTER_Y) ** 2,
      );
      const inEarthArea = earthInteractive && distEarth < EARTH_SIZE / 2 + 18;

      return !inButtonArea && !inEarthArea;
    },
    onPanResponderGrant: () => {
      if (
        screen === "game" &&
        gameMode === "peace" &&
        !gameOverRef.current &&
        !pausedRef.current
      ) {
        playPop();
      }
    },
    onPanResponderMove: (_, gestureState) => {
      if (gameOverRef.current || pausedRef.current || screen !== "game") return;

      const angle =
        Math.atan2(
          gestureState.moveY - CENTER_Y,
          gestureState.moveX - CENTER_X,
        ) *
        (180 / Math.PI);

      setMoonAngle(angle);
      moonAngleRef.current = angle;
    },
  });

  const moonX = CENTER_X + MOON_RADIUS * Math.cos((moonAngle * Math.PI) / 180);
  const moonY = CENTER_Y + MOON_RADIUS * Math.sin((moonAngle * Math.PI) / 180);

  const earthSpin = earthRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const moonSpin = moonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const earthBorderColor = earthHitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0)", "rgba(255,40,40,0.9)"],
  });

  const activeBgColor =
    skins.find((s) => s.id === activeBg)?.color ?? "#050a1a";

  const earthAsset = SKIN_ASSETS[activeEarth] ?? SKIN_ASSETS.default_earth;
  const moonAsset = SKIN_ASSETS[activeMoon] ?? SKIN_ASSETS.default_moon;

  const uiTheme = getUITheme(activeBg);

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: activeBgColor,
          transform: [{ translateX: screenShake }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Starfield />

      <GameScreen
        earthSpin={earthSpin}
        earthBorderColor={earthBorderColor}
        earthAsset={earthAsset}
        moonAsset={moonAsset}
        moonX={moonX}
        moonY={moonY}
        moonAngle={moonAngle}
        moonSpin={moonSpin}
        asteroids={asteroids}
        particles={particles}
        isPeaceMode={gameMode === "peace"}
        isMenu={screen === "menu"}
        earthInteractive={earthInteractive}
        theme={uiTheme}
        onMoonPress={startGame}
        onEarthTap={() => {
          playPop();
        }}
        onEarthLongPress={() => {
          if (screen === "menu") {
            startPeaceMode();
          }
        }}
      />

      {screen === "game" && !gameOver && gamePhase === "ready" && (
        <ReadyScreen
          theme={uiTheme}
          isPeaceMode={gameMode === "peace"}
          onComplete={() => setGamePhase("playing")}
        />
      )}

      {screen === "game" && !gameOver && gamePhase === "playing" && (
        <Hud
          score={gameMode === "peace" ? 0 : score}
          highScore={highScore}
          isPeaceMode={gameMode === "peace"}
          theme={uiTheme}
          onPause={() => {
            playClick();
            const next = !paused;
            setPaused(next);
            pausedRef.current = next;
          }}
        />
      )}

      {paused && screen === "game" && !gameOver && (
        <PauseOverlay
          sfxMuted={sfxMuted}
          musicMuted={musicMuted}
          theme={uiTheme}
          onToggleSfx={() => {
            playClick();
            setSfxMuted((m) => !m);
          }}
          onToggleMusic={() => {
            playClick();
            setMusicMuted((m) => !m);
          }}
          onResume={() => {
            playClick();
            setPaused(false);
            pausedRef.current = false;
            setShowQuitRunConfirm(false);
          }}
          onMenu={() => {
            playClick();

            if (gameMode === "peace") {
              resetGame();
              setScreen("menu");
              return;
            }

            setShowQuitRunConfirm(true);
          }}
        />
      )}

      {showQuitRunConfirm && paused && screen === "game" && !gameOver && (
        <QuitRunConfirmOverlay
          runCoins={hasClaimedDoubleCoins ? runCoins * 2 : runCoins}
          theme={uiTheme}
          onCancel={() => {
            playClick();
            setShowQuitRunConfirm(false);
          }}
          onConfirm={() => {
            playClick();
            setShowQuitRunConfirm(false);
            resetGame();
            setScreen("menu");
          }}
        />
      )}

      {screen === "menu" && (
        <MenuScreen
          highScore={highScore}
          tapPromptOpacity={tapPromptOpacity}
          theme={uiTheme}
          onPlay={() => {
            playClick();
            startGame();
          }}
          onShop={() => {
            playClick();
            setScreen("shop");
          }}
          onLeaderboard={() => {
            playClick();
            setScreen("leaderboard");
          }}
        />
      )}

      {screen === "shop" && (
        <ShopScreen
          skins={skins}
          sounds={sounds}
          coins={coins}
          shopTab={shopTab}
          activeEarth={activeEarth}
          activeMoon={activeMoon}
          activeBg={activeBg}
          activeSound={activeSound}
          theme={uiTheme}
          onSetTab={setShopTab}
          onBuySkin={(id) => {
            buySkin(id);
          }}
          onEquipSkin={(id, type) => {
            playClick();
            equipSkin(id, type);
          }}
          onBuySound={(id) => {
            buySound(id);
          }}
          onEquipSound={(id) => {
            playClick();
            equipSound(id);
          }}
          onBack={() => {
            playClick();
            setScreen("menu");
          }}
        />
      )}

      {screen === "leaderboard" && (
        <LeaderboardScreen
          topScores={topScores}
          theme={uiTheme}
          onBack={() => {
            playClick();
            setScreen("menu");
          }}
        />
      )}

      {gameOver && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          coinsEarned={runCoins}
          hasRevivedAlready={hasRevivedAlready}
          hasClaimedDoubleCoins={hasClaimedDoubleCoins}
          isReviveReady={isReviveReady}
          isDoubleCoinsReady={isDoubleCoinsReady}
          isAdInProgress={isAdInProgress}
          theme={uiTheme}
          onRevive={handleRevivePress}
          onDoubleCoins={handleDoubleCoinsPress}
          onReplay={async () => {
            playClick();
            await bankGameOverReward();
            resetGame();
            setScreen("game");
          }}
          onMenu={async () => {
            playClick();
            await bankGameOverReward();
            resetGame();
            setScreen("menu");
          }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050a1a" },
});
