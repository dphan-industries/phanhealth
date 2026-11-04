import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { UITheme, withAlpha } from "../constants/uiThemes";

type Props = {
  onComplete: () => void;
  theme: UITheme;
  isPeaceMode?: boolean;
};

export function ReadyScreen({ onComplete, theme, isPeaceMode = false }: Props) {
  const readyOpacity = useRef(new Animated.Value(0)).current;
  const startOpacity = useRef(new Animated.Value(0)).current;
  const startScale = useRef(new Animated.Value(0.7)).current;

  const hasCompleted = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    hasCompleted.current = false;

    readyOpacity.setValue(0);
    startOpacity.setValue(0);
    startScale.setValue(0.7);

    const animation = isPeaceMode
      ? Animated.sequence([
          Animated.parallel([
            Animated.timing(startOpacity, {
              toValue: 1,
              duration: 240,
              useNativeDriver: true,
            }),
            Animated.spring(startScale, {
              toValue: 1,
              friction: 7,
              tension: 90,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(350),
          Animated.timing(startOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ])
      : Animated.sequence([
          Animated.timing(readyOpacity, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.delay(350),
          Animated.timing(readyOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(startOpacity, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.spring(startScale, {
              toValue: 1,
              friction: 6,
              tension: 120,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(150),
          Animated.timing(startOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]);

    animation.start(({ finished }) => {
      if (!finished || hasCompleted.current) return;
      hasCompleted.current = true;
      onCompleteRef.current();
    });

    return () => {
      animation.stop();
    };
  }, [isPeaceMode, readyOpacity, startOpacity, startScale]);

  return (
    <View style={styles.overlay} pointerEvents="none">
      {!isPeaceMode && (
        <Animated.Text
          style={[
            styles.ready,
            {
              opacity: readyOpacity,
              color: withAlpha(theme.textPrimary, 0.96),
              textShadowColor: withAlpha(theme.overlayBg, 0.9),
            },
          ]}
        >
          READY
        </Animated.Text>
      )}

      <Animated.Text
        style={[
          isPeaceMode ? styles.peace : styles.start,
          {
            opacity: startOpacity,
            color: isPeaceMode
              ? withAlpha(theme.textPrimary, 0.96)
              : theme.titleMain,
            textShadowColor: isPeaceMode
              ? withAlpha(theme.overlayBg, 0.9)
              : withAlpha(theme.titleGlow, 0.95),
            transform: [{ scale: startScale }],
          },
        ]}
      >
        {isPeaceMode ? "PEACE MODE" : "START!"}
      </Animated.Text>
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
  ready: {
    position: "absolute",
    fontSize: 36,
    letterSpacing: 12,
    fontFamily: "Audiowide_400Regular",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  start: {
    position: "absolute",
    fontSize: 58,
    letterSpacing: 8,
    fontFamily: "Orbitron_900Black",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },
  peace: {
    position: "absolute",
    fontSize: 34,
    letterSpacing: 6,
    fontFamily: "Audiowide_400Regular",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
});
