import React from "react";
import { Player } from "lottie-react";
import successAnim from "../animations/success.json"; // CHANGE FILE NAME!

const AddToCartSuccessAnimation = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[100]">
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-72">
        <Player autoplay loop={false} src={successAnim} style={{ height: 180 }} />

        <h2 className="text-xl font-semibold text-primary mt-2">
          Added to Cart!
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Your customized flower item has been added.
        </p>
      </div>
    </div>
  );
};

export default AddToCartSuccessAnimation;
