import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useEffect, useRef } from "react";
import { SoundEffectId } from "../constants/sounds";

const POP = require("../assets/sounds/pop.mp3");
const BACKGROUND_MUSIC = require("../assets/sounds/alexgrohl-relaxing-460676.mp3");
const GAME_OVER_SOUND = require("../assets/sounds/gameOver.mp3");
const SOFT_CLICK = require("../assets/sounds/softClick.mp3");
const BUY_SOUND = require("../assets/sounds/buySound.mp3");
const ERROR_SOUND = require("../assets/sounds/errorSound.mp3");

const WATER_DROP = require("../assets/sounds/waterDrop.mp3");
const WINE_GLASS = require("../assets/sounds/wineGlass.mp3");
const TOY_SQUEAK = require("../assets/sounds/toySqueak.mp3");

const MAGIC_TWINKLE = require("../assets/sounds/magicTwinkle.mp3");
const BUBBLE_POP = require("../assets/sounds/bubblePop.mp3");
const COIN_CHIME = require("../assets/sounds/coinChime.mp3");
const PAGE_FLIP = require("../assets/sounds/pageFlip.mp3");
const SOFT_BREEZE = require("../assets/sounds/softBreeze.mp3");
const POWER_IMPACT = require("../assets/sounds/powerImpact.mp3");
const SILLY_TOOT = require("../assets/sounds/sillyToot.mp3");

export function useAudio(
  sfxMuted: boolean,
  musicMuted: boolean,
  paused: boolean,
  gameOver: boolean,
  activeSound: SoundEffectId,
  appIsActive: boolean,
) {
  const bgMusicPlayer = useAudioPlayer(BACKGROUND_MUSIC);
  const bgMusicStatus = useAudioPlayerStatus(bgMusicPlayer);

  const clickPlayer = useAudioPlayer(SOFT_CLICK);
  const popPlayer = useAudioPlayer(POP);
  const buyPlayer = useAudioPlayer(BUY_SOUND);
  const errorPlayer = useAudioPlayer(ERROR_SOUND);
  const gameOverPlayer = useAudioPlayer(GAME_OVER_SOUND);

  const waterDropPlayer = useAudioPlayer(WATER_DROP);
  const wineGlassPlayer = useAudioPlayer(WINE_GLASS);
  const toySqueakPlayer = useAudioPlayer(TOY_SQUEAK);

  const magicTwinklePlayer = useAudioPlayer(MAGIC_TWINKLE);
  const bubblePopPlayer = useAudioPlayer(BUBBLE_POP);
  const coinChimePlayer = useAudioPlayer(COIN_CHIME);
  const pageFlipPlayer = useAudioPlayer(PAGE_FLIP);
  const softBreezePlayer = useAudioPlayer(SOFT_BREEZE);
  const powerImpactPlayer = useAudioPlayer(POWER_IMPACT);
  const sillyTootPlayer = useAudioPlayer(SILLY_TOOT);

  const sfxMutedRef = useRef(sfxMuted);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    }).catch((e) => console.warn("Audio mode setup failed:", e));
  }, []);

  useEffect(() => {
    sfxMutedRef.current = sfxMuted;
  }, [sfxMuted]);

  useEffect(() => {
    bgMusicPlayer.volume = musicMuted ? 0 : 0.35;
  }, [musicMuted, bgMusicPlayer]);

  useEffect(() => {
    if (!bgMusicStatus.isLoaded) return;

    bgMusicPlayer.loop = true;

    const shouldPauseMusic = !appIsActive || gameOver || paused || musicMuted;

    if (shouldPauseMusic) {
      if (bgMusicStatus.playing) bgMusicPlayer.pause();
    } else if (!bgMusicStatus.playing) {
      bgMusicPlayer.play();
    }
  }, [
    appIsActive,
    gameOver,
    paused,
    musicMuted,
    bgMusicStatus.isLoaded,
    bgMusicStatus.playing,
    bgMusicPlayer,
  ]);

  const playPlayer = (player: ReturnType<typeof useAudioPlayer>) => {
    if (sfxMutedRef.current || !appIsActive) return;

    try {
      player.seekTo(0);
      player.play();
    } catch {}
  };

  const playClick = () => {
    if (sfxMutedRef.current || !appIsActive) return;
    playPlayer(clickPlayer);
  };

  const playBuy = () => {
    if (sfxMutedRef.current || !appIsActive) return;
    playPlayer(buyPlayer);
  };

  const playError = () => {
    if (sfxMutedRef.current || !appIsActive) return;
    playPlayer(errorPlayer);
  };

  const playGameOver = () => {
    if (sfxMutedRef.current || !appIsActive) return;
    playPlayer(gameOverPlayer);
  };

  const playPop = () => {
    if (sfxMutedRef.current || !appIsActive) return;

    switch (activeSound) {
      case "water_drop":
        playPlayer(waterDropPlayer);
        break;
      case "toy_squeak":
        playPlayer(toySqueakPlayer);
        break;
      case "wine_glass":
        playPlayer(wineGlassPlayer);
        break;
      case "magic_twinkle":
        playPlayer(magicTwinklePlayer);
        break;
      case "bubble_pop":
        playPlayer(bubblePopPlayer);
        break;
      case "coin_chime":
        playPlayer(coinChimePlayer);
        break;
      case "page_flip":
        playPlayer(pageFlipPlayer);
        break;
      case "soft_breeze":
        playPlayer(softBreezePlayer);
        break;
      case "power_impact":
        playPlayer(powerImpactPlayer);
        break;
      case "silly_toot":
        playPlayer(sillyTootPlayer);
        break;
      case "classic_pops":
      default:
        playPlayer(popPlayer);
        break;
    }
  };

  return {
    playPop,
    playGameOver,
    playClick,
    playBuy,
    playError,
  };
}
