// Dedicated entry for the Glow Up pack reels: bundles only these compositions.
// The repo-wide src/index.ts packs every reel and stalls at 50% on this machine.
// Render: remotion render src/refina/glowup/entry.ts GlowupS2 out/glowup/s2.mp4 --public-dir=public-glowup
import { registerRoot } from "remotion";
import { GlowupRoot } from "./root";

registerRoot(GlowupRoot);
