import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/animations/flower-hero.json";

const AnimatedHeroBadge = () => {
  return (
    <div className="h-24 w-24">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

export default AnimatedHeroBadge;
