import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { refina } from "../theme";
import { PhraseSequence } from "../../components/PhraseSequence";

/**
 * Short human cutaway — Madison speaking to camera. Full-bleed 9:16
 * clip. Its own audio is muted because the voiceover covers the whole
 * reel; the clip plays as visual B-roll under her VO line.
 */
export const TalkingHeadScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile("talkinghead.mp4")}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* legibility scrim for the caption */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 60,
          left: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0,0,0,0.42)",
          padding: "12px 20px",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: refina.mauve,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: refina.serifUpright,
            fontSize: 20,
          }}
        >
          M
        </div>
        <div style={{ fontFamily: refina.sans, color: "white", lineHeight: 1.2 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Madison</div>
          <div style={{ fontSize: 14, opacity: 0.85 }}>real Refina AI user</div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "12%", left: 0, right: 0, height: 160 }}>
        <PhraseSequence
          variant="voiceover"
          color="#fff"
          phrases={[{ text: "I could actually see it before I did it.", frames: 90 }]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const TALKINGHEAD_DURATION = 90;
