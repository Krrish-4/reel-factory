import "./index.css";
import { RefinaChanged } from "./refina/changed/RefinaChanged";

/*
 * Only the sample reel is registered: it is the one whose assets ship in
 * public/ (the AI-generated `demo1` subject + voiceover-changed.mp3).
 *
 * Every other reel under src/refina/ ships as CODE ONLY — it is the beat
 * library the refina-reel skill points at (protocol/atoms, preview/*,
 * ratio/atoms, kit/*). Their portraits, UI exports and voiceovers were
 * client material and are not in this repo. To bring one back, regenerate
 * its assets through gen/ (see gen/README.md), then import and register it
 * here, e.g.:
 *
 *   import { RefinaRatio } from "./refina/ratio/RefinaRatio";
 *   ...
 *   <RefinaRatio />
 *
 * A new reel goes in src/refina/<slug>/ and gets one line below.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <RefinaChanged />
    </>
  );
};
