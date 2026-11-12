import { Composition, Img, Sequence, staticFile } from "remotion";
import { displayFont, sansFont } from "../../fonts";
import { SAGE, Stage } from "./atoms";
import {
  AnimatedCheckList,
  ChatThread,
  CountUp,
  Cursor,
  Montage,
  PopIn,
  PushWipe,
  ScrollReveal,
  SlideIn,
  SlideOver,
  SliderReveal,
  StepPill,
  TrimPath,
} from "./motion";

const HOLD = 105; // ~3.5s per demo card

const Title: React.FC<{ n: number; text: string }> = ({ n, text }) => (
  <div
    style={{
      position: "absolute",
      top: 90,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: displayFont,
      fontWeight: 300,
      fontSize: 46,
      color: "#fff",
    }}
  >
    {n}. {text}
  </div>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

const Box: React.FC<{ label: string; w?: number; h?: number; bg?: string }> = ({
  label,
  w = 300,
  h = 300,
  bg = "#fff",
}) => (
  <div
    style={{
      width: w,
      height: h,
      background: bg,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: sansFont,
      fontSize: 26,
      color: "#1d2224",
    }}
  >
    {label}
  </div>
);

const P = (n: string) => staticFile(`portraits/${n}.png`);
const Face: React.FC<{ n: string }> = ({ n }) => (
  <Img src={P(n)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
);

export const MotionLabVideo: React.FC = () => {
  let i = 0;
  const at = () => ({ from: HOLD * i++, durationInFrames: HOLD });

  return (
    <Stage>
      <Sequence {...at()}>
        <Title n={1} text="PopIn — spring overshoot" />
        <Card>
          <div style={{ display: "flex", gap: 26 }}>
            {[0, 8, 16, 24].map((d, k) => (
              <PopIn key={k} from={20 + d}>
                <Box label={`${k + 1}`} w={170} h={170} />
              </PopIn>
            ))}
          </div>
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={2} text="SlideIn — four directions" />
        <Card>
          <div style={{ display: "flex", gap: 22 }}>
            <SlideIn from={18} dir="up"><Box label="up" w={150} h={150} /></SlideIn>
            <SlideIn from={28} dir="down"><Box label="down" w={150} h={150} /></SlideIn>
            <SlideIn from={38} dir="left"><Box label="left" w={150} h={150} /></SlideIn>
            <SlideIn from={48} dir="right"><Box label="right" w={150} h={150} /></SlideIn>
          </div>
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={3} text="CountUp — 72 → 86" />
        <Card>
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 200,
              fontSize: 230,
              color: "#fff",
            }}
          >
            <CountUp from={20} start={72} end={86} dur={45} />
          </div>
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={4} text="TrimPath — line draws itself" />
        <Card>
          <div style={{ position: "relative", width: 900, height: 500 }}>
            <TrimPath
              from={18}
              dur={30}
              width={900}
              height={500}
              d="M60 420 C 260 420, 300 120, 520 120 L 840 120"
              strokeWidth={3}
            />
            <TrimPath
              from={20}
              dur={26}
              width={900}
              height={500}
              d="M60 300 L 700 300"
              dashed
            />
          </div>
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={5} text="SliderReveal — masked before/after" />
        <Card>
          <div style={{ borderRadius: 16, overflow: "hidden" }}>
            <SliderReveal
              from={16}
              dur={60}
              width={520}
              height={700}
              before={<Face n="front-before" />}
              after={<Face n="front-after" />}
            />
          </div>
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={6} text="PushWipe — incoming shoves outgoing" />
        <Card>
          <div style={{ borderRadius: 16, overflow: "hidden" }}>
            <PushWipe
              at={HOLD * 5 + 30}
              dur={22}
              width={520}
              height={700}
              outgoing={<Face n="front-generic" />}
              incoming={<Face n="front-after" />}
            />
          </div>
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={7} text="ScrollReveal — list scrolls up" />
        <Card>
          <div style={{ border: "2px solid #fff", borderRadius: 24, overflow: "hidden" }}>
            <ScrollReveal from={14} dur={80} distance={520} width={460} height={620}>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {["Skin", "Eyebrows", "Eyes", "Cheeks", "Lips", "Jaw", "Nose", "Neck"].map((r) => (
                  <div
                    key={r}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "22px 18px",
                      fontFamily: sansFont,
                      fontSize: 26,
                      color: "#1d2224",
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={8} text="ChatThread — bubbles arrive" />
        <Card>
          <ChatThread
            messages={[
              { text: "Can you show me a softer jawline?", side: "out", at: 14 },
              { text: "Sure — re-rendering now.", side: "in", at: 34 },
              { text: "Here's your updated preview.", side: "in", at: 52 },
            ]}
          />
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={9} text="Montage — rhythmic hard cuts" />
        <Card>
          <div style={{ width: 440, height: 660, borderRadius: 16, overflow: "hidden" }}>
            <Montage from={14} hold={11}>
              {[
                <Box key="a" label="Proportions" w={440} h={660} />,
                <Box key="b" label="Skin" w={440} h={660} bg="#eef2f3" />,
                <Box key="c" label="Nose" w={440} h={660} />,
                <Box key="d" label="Jaw" w={440} h={660} bg="#eef2f3" />,
                <Box key="e" label="Summary" w={440} h={660} />,
                <Box key="f" label="Score" w={440} h={660} bg="#eef2f3" />,
              ]}
            </Montage>
          </div>
        </Card>
      </Sequence>

      <Sequence {...at()}>
        <Title n={10} text="Cursor — glides and clicks" />
        <Card>
          <div
            style={{
              width: 720,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "2px solid #fff",
              borderRadius: 48,
              padding: "22px 34px",
              fontFamily: displayFont,
              fontWeight: 300,
              fontSize: 40,
              color: "#fff",
            }}
          >
            <span>Refina AI</span>
            <span>⌕</span>
          </div>
        </Card>
        <Cursor fromX={220} fromY={1420} toX={806} toY={1000} start={16} travel={34} />
      </Sequence>

      <Sequence {...at()}>
        <Title n={11} text="StepPill — numbered badge" />
        <Card>
          <Box label="content" w={420} h={520} />
        </Card>
        <StepPill n={1} from={16} style={{ top: 520, left: 400 }} />
        <StepPill n={2} from={40} style={{ top: 520, left: 500 }} />
        <StepPill n={3} from={64} style={{ top: 520, left: 600 }} />
      </Sequence>

      <Sequence {...at()}>
        <Title n={12} text="AnimatedCheckList — ticks draw in" />
        <AnimatedCheckList
          items={["Skin", "Brows", "Eyes", "Lips", "Jaw", "Neck"]}
          from={16}
          step={10}
          x={360}
          y={620}
          size={46}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={13} text="SlideOver — panel covers the face" />
        <Card>
          <div style={{ width: 520, height: 720, borderRadius: 16, overflow: "hidden" }}>
            <Face n="front-before" />
          </div>
        </Card>
        <SlideOver from={22} dir="up">
          <div
            style={{
              position: "absolute",
              left: 120,
              right: 120,
              top: 900,
              background: "#fff",
              borderRadius: 18,
              padding: 30,
              fontFamily: sansFont,
              fontSize: 28,
              color: "#1d2224",
            }}
          >
            Dashboard panel slides in over the subject
          </div>
        </SlideOver>
      </Sequence>
    </Stage>
  );
};

export const MotionLab: React.FC = () => (
  <Composition
    id="MotionLab"
    component={MotionLabVideo}
    durationInFrames={HOLD * 13}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{}}
  />
);

export const MOTION_LAB_BG = SAGE;
