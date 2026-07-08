import React from "react";
import { Player } from "lottie-react";
import loadingAnim from "../animations/loading.json"; // CHANGE to your file name

const Loading = () => {
  return (
    <div className="flex items-center justify-center p-10">
      <Player
        autoplay
        loop
        src={loadingAnim}
        className="w-20 h-20"
      />
    </div>
  );
};

export default Loading;
