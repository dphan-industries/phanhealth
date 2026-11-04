import React from "react";
import { View } from "react-native";
import { STARS } from "../constants/stars";

export function Starfield() {
  return (
    <>
      {STARS.map((star, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: `rgba(255,255,255,${star.opacity})`,
          }}
        />
      ))}
    </>
  );
}
