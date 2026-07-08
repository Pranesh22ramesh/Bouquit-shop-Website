// src/components/FlowerHeroAnimation.jsx
import React from "react";
import { Player } from "lottie-react";
import flowerBouquet from "../animations/flower-bouquet.json"; // file name change panniko

const FlowerHeroAnimation = () => {
  return (
    <div
      style={{
        width: "260px",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <Player
        autoplay
        loop
        src={flowerBouquet}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default FlowerHeroAnimation;
