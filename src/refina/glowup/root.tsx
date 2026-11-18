import React from "react";
import { GlowupS2 } from "./s2/GlowupS2";
import { GlowupS5 } from "./s5/GlowupS5";
import { GlowupSize } from "./size/GlowupSize";
import { GlowupLawrence } from "./lawrence/GlowupLawrence";

export const GlowupRoot: React.FC = () => (
  <>
    <GlowupS2 />
    <GlowupS5 />
    <GlowupSize />
    <GlowupLawrence />
  </>
);
