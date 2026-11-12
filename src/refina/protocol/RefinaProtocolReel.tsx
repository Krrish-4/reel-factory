import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  staticFile,
} from "remotion";
import { displayFont } from "../../fonts";
import {
  Callout,
  Captions,
  ConvergeReveal,
  Cue,
  DataCard,
  FaceContour,
  Headline,
  Pips,
  Portrait,
  screen,
  SearchBar,
  SectionPill,
  SplitPanels,
  Stage,
  ThoughtBubble,
  VerdictTag,
} from "./atoms";
import {
  AnimatedCheckList,
  Camera,
  ChatThread,
  CountUp,
  Cursor,
  Exit,
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

const FPS = 30;
const TOTAL = 2328; // 77.61s — matches voiceover3.mp3 exactly

/* Two subjects. `A` = younger woman, `B` = older woman (also the subject
   composited into the app screens, so phone beats pair with B). */
/* A's photos carry their own studio backdrop (measured #B6CAD3 / #BACED7 —
   averaged here); B's are still alpha cutouts, so B passes no `bg`. */
const A = {
  before: "front-before",
  after: "front-after",
  frac: 0.073,
  bg: "#B8CCD5",
  ratio: 1792 / 2400,
  dxBefore: 0.0131,
  dxAfter: -0.0027,
};
const B = {
  before: "alt-before",
  after: "alt-after",
  /* alt-after was regenerated at 1792x2400 and sits higher in frame than
     alt-before (still 1122x1402), so the two need separate head fractions. */
  frac: 0.0606,
  fracAfter: 0.05,
  bg: "#B8CCD5",
  ratio: 1122 / 1402,
  dxBefore: 0.0124,
  dxAfter: 0.002,
};

/* The "someone else's plan" face in the problem/bringout beats. It has to be
   a visibly different person from A or the argument doesn't land, so it uses
   B's after. The old `front-generic` came from the discarded ChatGPT source. */
const OTHER = "alt-after";

const CUES: Cue[] = [
  { f: 0, t: 65, s: "You have no idea how attractive you could be." },
  { f: 65, t: 161, s: "We can show you exactly what the best you would look like." },
  { f: 161, t: 228, s: "Then show you how to get there." },
  { f: 228, t: 263, s: "How can we do this?" },
  { f: 263, t: 342, s: "How to do this was relatively straightforward." },
  { f: 342, t: 421, s: "Every procedure is rendered onto your actual photo —" },
  { f: 421, t: 510, s: "your skin tone, your lighting, your bone structure —" },
  { f: 510, t: 596, s: "to show you both what actually changes a face," },
  { f: 596, t: 653, s: "and what each procedure really does." },
  { f: 653, t: 707, s: "Now, on your end, it's as simple as" },
  { f: 707, t: 734, s: "uploading a photo," },
  { f: 734, t: 806, s: "choosing the procedure you're considering," },
  { f: 806, t: 906, s: "and seeing exactly what those changes would look like." },
  { f: 906, t: 967, s: "This approach has three benefits." },
  { f: 967, t: 1035, s: "First, it's effective and efficient," },
  { f: 1035, t: 1070, s: "tailored to you." },
  { f: 1070, t: 1148, s: "Most people take a one-size-fits-all approach to beauty," },
  { f: 1148, t: 1207, s: "copying a celebrity they've seen." },
  { f: 1207, t: 1281, s: "But the problem is, what works for one face" },
  { f: 1281, t: 1329, s: "might not work for another." },
  { f: 1329, t: 1387, s: "Refina will bring out your beauty," },
  { f: 1387, t: 1442, s: "not turn you into someone else." },
  { f: 1442, t: 1530, s: "Our preview lets you try any procedure you're considering," },
  { f: 1530, t: 1633, s: "and see what that change would look like in advance," },
  { f: 1633, t: 1670, s: "to help you decide." },
  { f: 1670, t: 1725, s: "It can also reduce insecurities —" },
  { f: 1725, t: 1829, s: "if there's something you're able to change that's worth changing." },
  { f: 1829, t: 1884, s: "And then after you've seen it," },
  { f: 1884, t: 1956, s: "there's really no point in overthinking your face." },
  { f: 1956, t: 2035, s: "You'll know you literally look your best." },
  { f: 2035, t: 2137, s: "Most people are surprised by just how good they could look." },
  { f: 2137, t: 2225, s: "Refina analyzes your face, writes you a 22-page dossier," },
  { f: 2225, t: 2298, s: "and shows you what's possible." },
  { f: 2298, t: 2328, s: "Search Refina AI." },
];

/**
 * Beat boundaries. Every one of these used to sit on the exact frame of a
 * CUES boundary, so the headline, the visual and the caption all changed on
 * the same frame — which is what a slide advancing looks like. They are now
 * offset +10 frames from their cue: the new caption line lands first, then a
 * third of a second later the picture cuts to match it.
 *
 * `cta` is the exception — it is pulled *earlier*, to 2282, because that is
 * where the voiceover actually starts saying "Search Refina AI"
 * (76.06s x 30fps). It was firing 16 frames late.
 */
const B_ = {
  hook: [0, 352],
  rendered: [352, 520],
  changes: [520, 663],
  step1: [663, 744],
  step2: [744, 816],
  step3: [816, 916],
  benefits: [916, 1080],
  onesize: [1080, 1217],
  problem: [1217, 1339],
  bringout: [1339, 1452],
  tryany: [1452, 1680],
  insecurities: [1680, 1839],
  overthink: [1839, 1966],
  yourbest: [1966, 2045],
  surprised: [2045, 2147],
  dossier: [2147, 2282],
  cta: [2282, 2328],
} as const;

const at = (k: keyof typeof B_) => ({
  from: B_[k][0],
  durationInFrames: B_[k][1] - B_[k][0],
});
const len = (k: keyof typeof B_) => B_[k][1] - B_[k][0];

/* ── shared bits ──────────────────────────────────────────────────── */

/** A phone shell holding a real app screen. */
const Phone: React.FC<{
  children: React.ReactNode;
  width?: number;
  from?: number;
}> = ({ children, width = 404, from = 0 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <SlideIn from={from} dir="up" distance={110} dur={20}>
      <div
        style={{
          width,
          height: width * 2.318,
          borderRadius: 40,
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.85)",
          background: "#fff",
          boxShadow: "0 26px 60px rgba(30,45,50,0.25)",
        }}
      >
        {children}
      </div>
    </SlideIn>
  </AbsoluteFill>
);

const Screen: React.FC<{ name: string }> = ({ name }) => (
  <Img
    src={screen(name)}
    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 2%" }}
  />
);

/** Floating aesthetic-score card whose number ticks up. */
const ScoreCard: React.FC<{ from: number; x: number; y: number }> = ({ from, x, y }) => (
  <PopIn from={from} style={{ position: "absolute", left: x, top: y }}>
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "18px 26px",
        textAlign: "center",
        boxShadow: "0 12px 34px rgba(0,0,0,0.16)",
        fontFamily: displayFont,
      }}
    >
      <div style={{ fontSize: 15, letterSpacing: 2, color: "#8a9296" }}>
        AESTHETIC SCORE
      </div>
      <div style={{ fontSize: 66, fontWeight: 300, color: "#1d2224", lineHeight: 1.1 }}>
        <CountUp from={from + 8} start={72} end={86} dur={40} />
      </div>
    </div>
  </PopIn>
);

/**
 * One-shot sound effect at an absolute composition frame.
 *
 * These are synthesized (ffmpeg sine/noise + envelopes), not library samples —
 * serviceable, not premium. Volumes are deliberately low: a voiceover runs the
 * entire 77.6s and the SFX are accents under it, not events in their own right.
 * Swap the files in `public/sfx/` for real ones and nothing here changes.
 */
const Sfx: React.FC<{
  name: string;
  at: number;
  volume?: number;
  ext?: string;
  /** long enough for the sample to play out; short one-shots need ~40 */
  dur?: number;
}> = ({ name, at, volume = 0.2, ext = "wav", dur = 40 }) => (
  <Sequence from={at} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${name}.${ext}`)} volume={volume} />
  </Sequence>
);

/* ── the reel ─────────────────────────────────────────────────────── */

export const RefinaProtocolVideo: React.FC = () => {
  return (
    <Stage>
      <Audio src={staticFile("voiceover3.mp3")} />

      {/* SFX. Frames are absolute, pinned to specific motion. Beat starts are
          left silent so the cuts stay hard rather than becoming a whoosh track. */}
      {/* Riser builds through the converge. It peaks 45 frames in (measured),
          so from 70 the peak lands at 115 — just ahead of the impact at 128,
          trading a little of the hit for more audible ramp. */}
      <Sfx name="riser" at={70} volume={0.5} ext="mp3" dur={120} />
      <Sfx name="thud" at={128} volume={0.45} /> {/* halves meet */}
      <Sfx name="whoosh" at={130} volume={0.28} /> {/* phone materialises */}
      <Sfx name="tick" at={228} volume={0.4} /> {/* seam starts sweeping */}
      <Sfx name="whoosh" at={665} volume={0.28} /> {/* phone enters — step1 */}
      <Sfx name="click" at={715} volume={0.55} /> {/* cursor taps Continue */}
      <Sfx name="whoosh" at={746} volume={0.28} /> {/* phone enters — step2 */}
      <Sfx name="whoosh" at={818} volume={0.28} /> {/* phone enters — step3 */}
      <Sfx name="tick" at={838} volume={0.4} /> {/* slider grabbed */}
      <Sfx name="whoosh" at={2149} volume={0.28} /> {/* dossier phone enters */}
      <Sfx name="click" at={2302} volume={0.55} /> {/* CTA search click */}

      {/* 1 — HOOK, merged with the old `how` beat into one continuous move:
          hold -> converge -> dock into the phone -> app UI -> sweep -> score.
          The slider used to fire twice (once here as the composite seam, again
          in `how` inside the phone). It now happens once. */}
      <Sequence {...at("hook")}>
        <Camera dur={len("hook")} move="in" amount={0.06} panY={-52}>
          <ConvergeReveal
            before={A.before}
            after={A.after}
            ratio={A.ratio}
            headFrac={A.frac}
            beforeFaceDx={A.dxBefore}
            afterFaceDx={A.dxAfter}
          />
          <Sequence from={300}>
            <ScoreCard from={0} x={706} y={690} />
          </Sequence>
        </Camera>
        <Sequence durationInFrames={238}>
          <Headline
            lines={["We can show you", "how attractive you could be"]}
            italicSecond
          />
        </Sequence>
        <Sequence from={238}>
          <Headline lines={["How can we do this?"]} />
        </Sequence>
      </Sequence>

      {/* 3 — rendered on your real photo: callout lines draw themselves.
          The callouts point at facial features, so they have to live inside
          the same Camera as the portrait or they drift off the face. */}
      <Sequence {...at("rendered")}>
        {/* Right-side leaders are kept short and the push shallow: the camera
            scales about frame centre, so anything anchored near an edge gets
            carried further out as the beat runs. "Your bone structure" is the
            longest label and sets the limit. */}
        <Camera dur={len("rendered")} move="in" amount={0.042}>
          <Portrait name={A.before} size={93} headTop={540} headFrac={A.frac} bg={A.bg} />
          <Exit at={len("rendered") - 26} dir="left" distance={70}>
            <TrimPath from={16} dur={16} d="M330 760 L 450 760" dashed />
            <TrimPath from={34} dur={16} d="M790 1112 L 850 1112" dashed />
            <TrimPath from={52} dur={16} d="M716 1305 L 780 1305" dashed />
            <Callout label="Your lighting" x={330} y={760} side="left" len={120} from={22} />
            <Callout label="Your skin tone" x={790} y={1112} side="right" len={62} from={40} />
            <Callout label="Your bone structure" x={716} y={1305} side="right" len={50} from={58} />
            <StepPill n="1" from={10} style={{ top: 330, left: 470 }} />
          </Exit>
        </Camera>
        <Headline lines={["Rendered onto your real photo"]} />
      </Sequence>

      {/* 4 — what each procedure does */}
      <Sequence {...at("changes")}>
        <Camera dur={len("changes")} move="in" amount={0.05} panX={-16}>
          <Portrait name={A.after} size={93} headTop={560} headFrac={A.frac} bg={A.bg} />
          <Exit at={len("changes") - 26} dir="left" distance={70}>
            {/* anchors measured off a coordinate grid over the rendered frame,
                then inverse-transformed through the beat's camera. They were
                landing on the eye, the mid-cheek and the mid-cheek. */}
            <Callout label="Rhinoplasty" x={494} y={1266} side="left" len={190} from={16} />
            <Callout label="Lip Augmentation" x={592} y={1468} side="right" len={90} from={34} />
            <Callout label="Jawline Contouring" x={399} y={1492} side="left" len={150} from={52} />
            <StepPill n="2" from={8} style={{ top: 330, left: 470 }} />
          </Exit>
        </Camera>
        <SectionPill text="What does each procedure really do?" />
      </Sequence>

      {/* 5,6,7 — the three-step flow */}
      <Sequence {...at("step1")}>
        <Camera dur={len("step1")} move="in" amount={0.06}>
          <Phone from={2}>
            <Screen name="reference-photos" />
          </Phone>
          <Cursor fromX={742} fromY={1508} toX={540} toY={1318} start={26} travel={22} clickAt={52} />
        </Camera>
        <Headline lines={["Upload your photo"]} />
        <Pips active={1} />
      </Sequence>

      {/* step2/step3 already carry motion inside the phone (scroll, slider),
          so the camera runs shallower here to avoid compounding. */}
      <Sequence {...at("step2")}>
        <Camera dur={len("step2")} move="in" amount={0.03}>
          <Phone from={2}>
            <ScrollReveal from={12} dur={len("step2") - 14} distance={720} width={404} height={936}>
              <Img src={screen("select-procedures")} style={{ width: 404 }} />
            </ScrollReveal>
          </Phone>
        </Camera>
        <Headline lines={["Choose a procedure"]} />
        <Pips active={2} />
      </Sequence>

      <Sequence {...at("step3")}>
        <Camera dur={len("step3")} move="in" amount={0.035}>
          <Phone from={2}>
            <SliderReveal
              from={22}
              dur={60}
              width={404}
              height={936}
              dividerTop={125}
              dividerBottom={399}
              cursor
              before={<Screen name="your-result-before" />}
              after={<Screen name="your-result-after" />}
            />
          </Phone>
        </Camera>
        <Headline lines={["See exactly what it looks like"]} />
        <Pips active={3} />
      </Sequence>

      {/* 8 — three benefits: pips pop in one by one */}
      <Sequence {...at("benefits")}>
        <Camera dur={len("benefits")} move="in" amount={0.07}>
          <Portrait name={B.after} size={92} headTop={640} headFrac={B.fracAfter} bg={B.bg} />
        </Camera>
        <Headline lines={["Three key benefits…"]} />
        <div style={{ position: "absolute", top: "20.5%", left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30 }}>
          {[1, 2, 3].map((n) => (
            <PopIn key={n} from={18 + (n - 1) * 12}>
              <div
                style={{
                  width: 46, height: 46, borderRadius: "50%",
                  border: "2px solid #fff", color: "#fff",
                  fontFamily: displayFont, fontSize: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {n}
              </div>
            </PopIn>
          ))}
        </div>
      </Sequence>

      {/* 9 — one-size-fits-all: thought bubble + celebrity reference */}
      <Sequence {...at("onesize")}>
        <Camera dur={len("onesize")} move="in" amount={0.055} panX={18}>
          <Portrait name={A.before} size={86} headTop={800} headFrac={A.frac} bg={A.bg} />
          <Exit at={len("onesize") - 24} dir="up" distance={56}>
            <ThoughtBubble text="I want her lips" x={286} y={470} from={12} />
          </Exit>
          <PopIn from={44} style={{ position: "absolute", left: 690, top: 430 }}>
            <div
              style={{
                width: 210, height: 210, borderRadius: 18, overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0,0,0,0.22)", border: "3px solid #fff",
              }}
            >
              <Img
                src={staticFile("portraits/celeb.png")}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </PopIn>
        </Camera>
        <Headline lines={["Effective and efficient"]} />
        <Pips active={2} />
      </Sequence>

      {/* 10 — blind copying: the wrong result slides in, ✗ pops */}
      <Sequence {...at("problem")}>
        {/* Scale alone is not enough on the panel beats: the plate is small
            and centred, so a 6% push only travels ~13px at the panel edges.
            A uniform drift carries the whole plate instead. The real fix is
            the rule-5 re-layout (panels near full width). */}
        <Camera dur={len("problem")} move="in" amount={0.06} panY={-40}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 26 }}>
              <Panel src={A.before} label="YOU" />
              <SlideIn from={14} dir="left" distance={470} dur={22}>
                <Panel src={OTHER} label="SOMEONE ELSE'S PLAN" />
              </SlideIn>
            </div>
          </AbsoluteFill>
          <Exit at={len("problem") - 24} dir="right" distance={60}>
            <VerdictTag
              text="BLIND-COPYING"
              good={false}
              from={40}
              style={{ top: 782, right: 96 }}
            />
          </Exit>
        </Camera>
        <Headline lines={["What works for one face,", "won't suit others"]} />
      </Sequence>

      {/* 11 — the right result push-wipes the wrong one out, ✓ pops */}
      <Sequence {...at("bringout")}>
        <Camera dur={len("bringout")} move="in" amount={0.06} panY={-36}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 26 }}>
              <Panel src={A.before} label="YOU" />
              <div style={{ borderRadius: 10, overflow: "hidden" }}>
                <PushWipe
                  at={12}
                  dur={22}
                  width={452}
                  height={604}
                  outgoing={<Panel src={OTHER} label="" bare />}
                  incoming={<Panel src={A.after} label="" bare />}
                />
              </div>
            </div>
          </AbsoluteFill>
          <Exit at={len("bringout") - 24} dir="right" distance={60}>
            <VerdictTag text="CUSTOM PROTOCOL" good from={44} style={{ top: 782, right: 96 }} />
          </Exit>
        </Camera>
        <Headline lines={["We'll bring out your beauty"]} />
      </Sequence>

      {/* 12 — concierge: chat bubbles arrive, then the result expands */}
      {/* This is the longest beat (228f) and previously froze for its last
          98 frames. The chat beats are re-spread across the full length. */}
      <Sequence {...at("tryany")}>
        <Camera dur={len("tryany")} move="in" amount={0.065} panY={-80}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <ChatThread
              width={640}
              messages={[
                { text: "Can you show me a softer jawline instead?", side: "out", at: 18 },
                { text: "Of course — re-rendering now.", side: "in", at: 58 },
                { text: "Here's your updated preview.", side: "in", at: 104 },
              ]}
            />
          </AbsoluteFill>
          <PopIn from={138} style={{ position: "absolute", left: 300, top: 1140 }}>
            <div
              style={{
                width: 480, height: 500, borderRadius: 18, overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
              }}
            >
              <Img
                src={screen("your-result-after")}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 24%" }}
              />
            </div>
          </PopIn>
        </Camera>
        <Headline lines={["Try any procedure"]} />
      </Sequence>

      {/* 13 — reduce insecurities: dashboard slides over, data cards */}
      <Sequence {...at("insecurities")}>
        <Camera dur={len("insecurities")} move="in" amount={0.055}>
          <Portrait name={B.before} size={86} headTop={800} headFrac={B.frac} bg={B.bg} />
          <ThoughtBubble text="I don't like my jawline" x={262} y={470} from={10} />
          <Exit at={len("insecurities") - 26} dir="down" distance={80}>
            <SlideOver from={54} dir="up">
              <DataCard title="JAW ANGLE" value="118°" sub="within range" x={44} y={1215} from={62} />
              <DataCard title="CHIN PROJECTION" value="−2 mm" sub="slightly recessed" x={744} y={1330} from={86} w={288} />
            </SlideOver>
          </Exit>
        </Camera>
        <Headline lines={["Reduce insecurities"]} />
        <Pips active={3} />
      </Sequence>

      {/* 14 — no need to overthink: contour draws, checkmarks tick in */}
      <Sequence {...at("overthink")}>
        <Camera dur={len("overthink")} scaleFrom={1} scaleTo={1.05}>
          <Portrait name={B.after} size={86} headTop={760} headFrac={B.fracAfter} bg={B.bg} />
          <TrimPath
            from={12}
            dur={34}
            length={1900}
            d="M575 1062 C 782 1062, 792 1232, 776 1348 C 758 1472, 666 1560, 575 1563 C 484 1560, 392 1472, 374 1348 C 358 1232, 368 1062, 575 1062 Z"
            strokeWidth={2.5}
          />
        </Camera>
        <AnimatedCheckList
          items={["Skin", "Brows", "Eyes", "Lips", "Jaw", "Neck"]}
          from={20}
          step={14}
          x={62}
          y={930}
          size={38}
        />
        <Headline lines={["No need to overthink it"]} />
      </Sequence>

      {/* 15 — you'll know you look your best. Same framing as `overthink`,
          so the camera resumes at 1.05 rather than snapping back to 1. */}
      <Sequence {...at("yourbest")}>
        <Camera dur={len("yourbest")} scaleFrom={1.05} scaleTo={1.1}>
          <Portrait name={B.after} size={86} headTop={760} headFrac={B.fracAfter} bg={B.bg} />
          <FaceContour cx={575} cy={1312} rx={204} ry={250} />
        </Camera>
        <AnimatedCheckList
          items={["Skin", "Brows", "Eyes", "Lips", "Jaw", "Neck"]}
          from={0}
          step={0}
          x={62}
          y={930}
          size={38}
        />
        <Headline lines={["You'll know you look your best"]} />
      </Sequence>

      {/* 16 — you'd be surprised what's possible */}
      <Sequence {...at("surprised")}>
        <Camera dur={len("surprised")} move="in" amount={0.075}>
          <SplitPanels left={A.before} right={A.after} from={2} />
        </Camera>
        <Headline lines={["You'd be surprised what's possible"]} />
      </Sequence>

      {/* 17 — the dossier: rapid rhythmic montage of report pages */}
      <Sequence {...at("dossier")}>
        <Camera dur={len("dossier")} move="in" amount={0.05}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <SlideIn from={2} dir="up" distance={110} dur={18}>
              <div
                style={{
                  width: 404,
                  height: 936,
                  borderRadius: 40,
                  overflow: "hidden",
                  border: "2px solid rgba(255,255,255,0.85)",
                  background: "#fff",
                  boxShadow: "0 26px 60px rgba(30,45,50,0.25)",
                }}
              >
                {/* hold retimed 12 -> 10: the beat lost 26 frames in the
                    boundary shift and 12 pages x 12 would now overrun it. */}
                <Montage from={14} hold={10}>
                  {[11, 12, 13, 1, 2, 5, 6, 9, 10, 11, 3, 7].map((n, i) => (
                    <Img
                      key={i}
                      src={screen(`dossier-${n}`)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 2%" }}
                    />
                  ))}
                </Montage>
              </div>
            </SlideIn>
          </AbsoluteFill>
        </Camera>
        <Headline lines={["A 22-page dossier"]} />
      </Sequence>

      {/* 18 — search-bar CTA with a cursor that clicks.
          Retimed for the 46-frame beat, and reordered so the cursor arrives
          and clicks *before* the query types itself. It used to type while
          the cursor was still travelling. Still short — the proper fix is
          extending TOTAL past the voiceover so this can hold. */}
      <Sequence {...at("cta")}>
        <SearchBar query="Refina AI" from={0} typeFrom={22} />
        <Cursor fromX={250} fromY={1420} toX={812} toY={1002} start={0} travel={16} clickAt={20} />
      </Sequence>

      <Captions cues={CUES} />
    </Stage>
  );
};

/** Panel used by the blind-copying / custom-protocol beats. */
const Panel: React.FC<{
  src: string;
  label: string;
  bare?: boolean;
}> = ({ src, label, bare = false }) => (
  <div
    style={{
      position: "relative",
      width: 452,
      height: 604,
      borderRadius: bare ? 0 : 10,
      overflow: "hidden",
      background: "#B4C4C8",
    }}
  >
    <Img
      src={staticFile(`portraits/${src}.png`)}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        height: "142%",
        transform: "translate(-50%,-36%)",
      }}
    />
    {label ? (
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          background: "rgba(24,28,29,0.72)",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 20,
          letterSpacing: 2,
          padding: "6px 12px",
          borderRadius: 5,
        }}
      >
        {label}
      </div>
    ) : null}
  </div>
);

export const RefinaProtocolReel: React.FC = () => (
  <Composition
    id="RefinaProtocolReel"
    component={RefinaProtocolVideo}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

