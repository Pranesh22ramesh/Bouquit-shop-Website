import React from "react";
import { Player } from "lottie-react";
import flowerAnim from "../animations/flower-bloom.json"; // change your JSON filename

const FlowerAnimation = ({ width = 250 }) => {
  return (
    <Player
      autoplay
      loop
      src={flowerAnim}
      style={{
        width: width,
        height: width,
        margin: "0 auto",
      }}
    />
  );
};

export default FlowerAnimation;
