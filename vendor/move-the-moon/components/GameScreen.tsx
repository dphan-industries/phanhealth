import React, { useRef } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Path,
  Image as SvgImage,
} from "react-native-svg";
import { CENTER_X, CENTER_Y, EARTH_SIZE, MOON_SIZE } from "../constants/game";
import { UITheme, withAlpha } from "../constants/uiThemes";
import { Asteroid, Particle } from "../types";

type Props = {
  earthSpin: Animated.AnimatedInterpolation<string>;
  earthBorderColor: Animated.AnimatedInterpolation<string>;
  earthAsset: ImageSourcePropType;
  moonAsset: ImageSourcePropType;
  moonX: number;
  moonY: number;
  moonAngle: number;
  moonSpin: Animated.AnimatedInterpolation<string>;
  asteroids: Asteroid[];
  particles: Particle[];
  isPeaceMode: boolean;
  isMenu: boolean;
  earthInteractive: boolean;
  theme: UITheme;
  onMoonPress: () => void;
  onEarthTap: () => void;
  onEarthLongPress: () => void;
};

const EARTH_ROTATION_SCALE = 1.42;
const EARTH_ROTATION_SIZE = EARTH_SIZE * EARTH_ROTATION_SCALE;
const EARTH_ROTATION_OFFSET = (EARTH_ROTATION_SIZE - EARTH_SIZE) / 2;

const ATMOSPHERE_PAD = EARTH_SIZE * 0.22;
const EARTH_WRAP_SIZE = EARTH_SIZE + ATMOSPHERE_PAD * 2;
const EARTH_CENTER = EARTH_WRAP_SIZE / 2;
const EARTH_RADIUS = EARTH_SIZE / 2;

const normalizeAngle = (angle: number) => {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
};

function getMoonPhase(angleDeg: number): string {
  const a = normalizeAngle(angleDeg);

  if (a < 22.5 || a >= 337.5) return "New Moon";
  if (a < 67.5) return "Waxing Crescent";
  if (a < 112.5) return "First Quarter";
  if (a < 157.5) return "Waxing Gibbous";
  if (a < 202.5) return "Full Moon";
  if (a < 247.5) return "Waning Gibbous";
  if (a < 292.5) return "Last Quarter";
  return "Waning Crescent";
}

function getMoonPhaseTextPosition(angleDeg: number): {
  top?: number;
  bottom?: number;
  textAlign: "center";
  alignSelf: "center";
} {
  const a = normalizeAngle(angleDeg);

  if (a >= 202.5 && a < 337.5) {
    return {
      top: -24,
      textAlign: "center",
      alignSelf: "center",
    };
  }

  return {
    bottom: -24,
    textAlign: "center",
    alignSelf: "center",
  };
}

function getCirclePath(size: number) {
  const r = size / 2;
  const cx = r;
  const cy = r;

  return `
    M ${cx} ${cy - r}
    A ${r} ${r} 0 1 1 ${cx} ${cy + r}
    A ${r} ${r} 0 1 1 ${cx} ${cy - r}
    Z
  `;
}

function getLitPath(angleDeg: number, size: number) {
  const a = normalizeAngle(angleDeg);
  const theta = (a * Math.PI) / 180;
  const illuminated = (1 - Math.cos(theta)) / 2;
  const r = size / 2;
  const cx = r;
  const cy = r;
  const litRight = a <= 180;
  const cosAbs = Math.abs(Math.cos(theta));
  const rx = Math.max(0.001, r * cosAbs);

  if (illuminated <= 0.001) return "";
  if (illuminated >= 0.999) return getCirclePath(size);

  const outerSweep = litRight ? 1 : 0;
  const isCrescent = illuminated < 0.5;
  const sameSideSweep = litRight ? 0 : 1;
  const oppositeSideSweep = litRight ? 1 : 0;
  const innerSweep = isCrescent ? sameSideSweep : oppositeSideSweep;

  if (cosAbs < 0.001) {
    return `
      M ${cx} ${cy - r}
      A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r}
      L ${cx} ${cy - r}
      Z
    `;
  }

  return `
    M ${cx} ${cy - r}
    A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r}
    A ${rx} ${r} 0 0 ${innerSweep} ${cx} ${cy - r}
    Z
  `;
}

function getShadowPath(angleDeg: number, size: number) {
  const circlePath = getCirclePath(size);
  const litPath = getLitPath(angleDeg, size);

  if (!litPath) return circlePath;

  const a = normalizeAngle(angleDeg);
  const theta = (a * Math.PI) / 180;
  const illuminated = (1 - Math.cos(theta)) / 2;

  if (illuminated >= 0.999) return "";
  return `${circlePath} ${litPath}`;
}

export function GameScreen({
  earthSpin,
  earthBorderColor,
  earthAsset,
  moonAsset,
  moonX,
  moonY,
  moonAngle,
  moonSpin,
  asteroids,
  particles,
  isPeaceMode,
  isMenu,
  earthInteractive,
  theme,
  onMoonPress,
  onEarthTap,
  onEarthLongPress,
}: Readonly<Props>) {
  const litPath = getLitPath(moonAngle, MOON_SIZE);
  const shadowPath = getShadowPath(moonAngle, MOON_SIZE);
  const moonPhaseText = getMoonPhase(moonAngle);
  const moonPhaseTextPosition = getMoonPhaseTextPosition(moonAngle);

  const earthPressY = useRef(new Animated.Value(0)).current;
  const earthPressScale = useRef(new Animated.Value(1)).current;
  const longPressTriggeredRef = useRef(false);

  const animateEarthIn = () => {
    Animated.parallel([
      Animated.timing(earthPressY, {
        toValue: 4,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(earthPressScale, {
        toValue: 0.97,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateEarthOut = () => {
    Animated.parallel([
      Animated.spring(earthPressY, {
        toValue: 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(earthPressScale, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    requestAnimationFrame(() => {
      longPressTriggeredRef.current = false;
    });
  };

  const handleEarthPress = () => {
    if (longPressTriggeredRef.current) return;
    onEarthTap();
  };

  const handleEarthLongPress = () => {
    longPressTriggeredRef.current = true;
    onEarthLongPress();
  };

  return (
    <>
      <Pressable
        disabled={!earthInteractive}
        onPressIn={animateEarthIn}
        onPressOut={animateEarthOut}
        onPress={handleEarthPress}
        onLongPress={handleEarthLongPress}
        delayLongPress={1800}
        style={[
          styles.earthWrap,
          {
            left: CENTER_X - EARTH_WRAP_SIZE / 2,
            top: CENTER_Y - EARTH_WRAP_SIZE / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.earthPressBody,
            {
              transform: [
                { translateY: earthPressY },
                { scale: earthPressScale },
              ],
            },
          ]}
        >
          <Svg
            pointerEvents="none"
            width={EARTH_WRAP_SIZE}
            height={EARTH_WRAP_SIZE}
            viewBox={`0 0 ${EARTH_WRAP_SIZE} ${EARTH_WRAP_SIZE}`}
            style={styles.earthAtmosphere}
          >
            <Circle
              cx={EARTH_CENTER}
              cy={EARTH_CENTER}
              r={EARTH_RADIUS + 18}
              fill={withAlpha(theme.atmosphereBase, 0.02)}
            />
            <Circle
              cx={EARTH_CENTER}
              cy={EARTH_CENTER}
              r={EARTH_RADIUS + 12}
              fill={withAlpha(theme.atmosphereBase, 0.035)}
            />
            <Circle
              cx={EARTH_CENTER}
              cy={EARTH_CENTER}
              r={EARTH_RADIUS + 7}
              fill={withAlpha(theme.atmosphereBase, 0.05)}
            />
            <Circle
              cx={EARTH_CENTER}
              cy={EARTH_CENTER}
              r={EARTH_RADIUS + 2}
              fill="none"
              stroke={withAlpha(theme.atmosphereBase, 0.22)}
              strokeWidth={4}
            />
            <Circle
              cx={EARTH_CENTER}
              cy={EARTH_CENTER}
              r={EARTH_RADIUS + 9}
              fill="none"
              stroke={withAlpha(theme.atmosphereBase, 0.08)}
              strokeWidth={10}
            />
          </Svg>

          <Animated.View
            style={[styles.earth, { borderColor: earthBorderColor }]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.earthSpinLayer,
                { transform: [{ rotate: earthSpin }] },
              ]}
            >
              <Image
                source={earthAsset}
                style={styles.earthImage}
                resizeMode="cover"
              />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Pressable>

      <View
        style={[
          styles.moonTouchable,
          { left: moonX - MOON_SIZE / 2, top: moonY - MOON_SIZE / 2 },
        ]}
        onStartShouldSetResponder={() => isMenu}
        onResponderRelease={onMoonPress}
      >
        <Svg
          style={styles.moonAtmosphere}
          width={MOON_SIZE + 8}
          height={MOON_SIZE + 8}
          viewBox={`0 0 ${MOON_SIZE + 8} ${MOON_SIZE + 8}`}
          pointerEvents="none"
        >
          <Circle
            cx={(MOON_SIZE + 8) / 2}
            cy={(MOON_SIZE + 8) / 2}
            r={MOON_SIZE / 2 + 2}
            fill="none"
            stroke={withAlpha(theme.atmosphereBase, 0.06)}
            strokeWidth={4}
          />
          <Circle
            cx={(MOON_SIZE + 8) / 2}
            cy={(MOON_SIZE + 8) / 2}
            r={MOON_SIZE / 2 + 1}
            fill="none"
            stroke={withAlpha(theme.atmosphereBase, 0.11)}
            strokeWidth={2}
          />
        </Svg>

        <View
          style={[
            styles.moon,
            { backgroundColor: withAlpha(theme.overlayBg, 0.95) },
          ]}
        >
          <Animated.View
            style={[styles.moonRotation, { transform: [{ rotate: moonSpin }] }]}
          >
            <Svg
              width={MOON_SIZE}
              height={MOON_SIZE}
              viewBox={`0 0 ${MOON_SIZE} ${MOON_SIZE}`}
            >
              <Defs>
                <ClipPath id="moonCircleClip">
                  <Circle
                    cx={MOON_SIZE / 2}
                    cy={MOON_SIZE / 2}
                    r={MOON_SIZE / 2}
                  />
                </ClipPath>
              </Defs>

              <G clipPath="url(#moonCircleClip)">
                <SvgImage
                  href={moonAsset}
                  x={-MOON_SIZE * 0.25}
                  y={-MOON_SIZE * 0.25}
                  width={MOON_SIZE * 1.5}
                  height={MOON_SIZE * 1.5}
                  preserveAspectRatio="xMidYMid slice"
                />
              </G>
            </Svg>
          </Animated.View>
          <Svg
            style={StyleSheet.absoluteFill}
            width={MOON_SIZE}
            height={MOON_SIZE}
            viewBox={`0 0 ${MOON_SIZE} ${MOON_SIZE}`}
          >
            <Circle
              cx={MOON_SIZE / 2}
              cy={MOON_SIZE / 2}
              r={MOON_SIZE / 2}
              fill={withAlpha(theme.overlayBg, 0.12)}
            />
            {shadowPath ? (
              <Path
                d={shadowPath}
                fill={withAlpha(theme.overlayBg, 0.88)}
                fillRule={litPath ? "evenodd" : "nonzero"}
              />
            ) : null}
            {shadowPath ? (
              <Path
                d={shadowPath}
                fill={withAlpha(theme.accent, 0.08)}
                fillRule={litPath ? "evenodd" : "nonzero"}
              />
            ) : null}
            {shadowPath ? (
              <Path
                d={shadowPath}
                fill="rgba(0,0,0,0.14)"
                fillRule={litPath ? "evenodd" : "nonzero"}
              />
            ) : null}
          </Svg>
        </View>

        {isMenu && (
          <Animated.Text
            style={[
              styles.moonTapLabel,
              { color: withAlpha(theme.textPrimary, 0.62) },
            ]}
          >
            TAP
          </Animated.Text>
        )}

        {isPeaceMode && (
          <View
            pointerEvents="none"
            style={[
              styles.moonPhaseTextWrap,
              {
                top: moonPhaseTextPosition.top,
                bottom: moonPhaseTextPosition.bottom,
                alignSelf: moonPhaseTextPosition.alignSelf,
              },
            ]}
          >
            <Text
              style={[
                styles.moonPhaseText,
                {
                  textAlign: moonPhaseTextPosition.textAlign,
                  color: withAlpha(theme.textPrimary, 0.88),
                  textShadowColor: withAlpha(theme.overlayBg, 0.55),
                },
              ]}
            >
              {moonPhaseText}
            </Text>
          </View>
        )}
      </View>

      {asteroids.map((a) => (
        <View
          key={a.id}
          style={[
            styles.asteroidWrap,
            {
              transform: [{ translateX: a.x - 18 }, { translateY: a.y - 18 }],
            },
          ]}
        >
          <Image
            source={require("../assets/images/asteroid.png")}
            style={{
              width: 36,
              height: 36,
              transform: [{ rotate: `${a.rotation}deg` }],
            }}
            resizeMode="contain"
          />
        </View>
      ))}

      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: p.color,
            opacity: p.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [
              {
                scale: p.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.5, 0.2],
                }),
              },
            ],
          }}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  earthWrap: {
    position: "absolute",
    width: EARTH_WRAP_SIZE,
    height: EARTH_WRAP_SIZE,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  earthAtmosphere: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  earth: {
    width: EARTH_SIZE,
    height: EARTH_SIZE,
    borderRadius: EARTH_SIZE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0)",
    backgroundColor: "#000",
  },
  earthSpinLayer: {
    position: "absolute",
    left: -EARTH_ROTATION_OFFSET,
    top: -EARTH_ROTATION_OFFSET,
    width: EARTH_ROTATION_SIZE,
    height: EARTH_ROTATION_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  earthImage: {
    width: EARTH_ROTATION_SIZE,
    height: EARTH_ROTATION_SIZE,
  },
  earthPressBody: {
    width: EARTH_WRAP_SIZE,
    height: EARTH_WRAP_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  moonTouchable: {
    position: "absolute",
    width: MOON_SIZE,
    height: MOON_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  moon: {
    width: MOON_SIZE,
    height: MOON_SIZE,
    borderRadius: MOON_SIZE / 2,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  moonRotation: {
    width: MOON_SIZE,
    height: MOON_SIZE,
  },
  moonAtmosphere: {
    position: "absolute",
    left: -4,
    top: -4,
  },
  moonTapLabel: {
    position: "absolute",
    bottom: -18,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: "Audiowide_400Regular",
  },
  moonPhaseTextWrap: {
    position: "absolute",
    minWidth: 120,
  },
  moonPhaseText: {
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: "Audiowide_400Regular",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  asteroidWrap: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
