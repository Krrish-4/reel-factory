import React from "react";
import { AbsoluteFill, Composition, Img, Sequence } from "remotion";
import { SAGE, portrait } from "../protocol/atoms";
import { sansFont } from "../../fonts";
import {
  AnimatedBarChart,
  CardCarousel,
  CardStack,
  CitationCard,
  Collage,
  FaceMesh,
  NetworkGraph,
  OverlayToggle,
  ScanOverlay,
  SyncProgressTimeline,
  TypewriterInput,
  CardScrollStack,
  DimensionCallout,
  DualCardLayout,
  InlineTextSwap,
  MetricSlider,
  RadialFan,
  StaggerGrid,
  TargetReticle,
} from "./index";

/**
 * Demo surface for the component kit, in the manner of MotionLab.
 *
 * A component library you cannot see is a library nobody uses. Each section
 * runs one component with realistic content so its timing can be judged, and
 * so a still can be rendered when something changes.
 */

const Label: React.FC<{ n: string; sub: string }> = ({ n, sub }) => (
  <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center" }}>
    <div style={{ fontFamily: sansFont, fontSize: 44, color: "#fff" }}>{n}</div>
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 19,
        letterSpacing: 1.6,
        color: "rgba(255,255,255,0.6)",
        marginTop: 10,
      }}
    >
      {sub}
    </div>
  </div>
);

const Centre: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    {children}
  </AbsoluteFill>
);

const Tile: React.FC<{ name: string; caption?: string }> = ({ name, caption }) => (
  <div style={{ borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
    <Img src={portrait(name)} style={{ width: "100%", display: "block" }} />
    {caption ? (
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 17,
          color: "rgba(255,255,255,0.85)",
          padding: "8px 10px",
        }}
      >
        {caption}
      </div>
    ) : null}
  </div>
);

const Face: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden" }}>
    <Img src={portrait(name)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

const Dot: React.FC = () => (
  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#E8D8A8",
                border: "2px solid rgba(255,255,255,0.9)" }} />
);

const KitLabVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: SAGE }}>
    <Sequence durationInFrames={95}>
      <Label n="MetricSlider" sub="ABSORBS 6 CORPUS ANIMATIONS" />
      <Centre>
        <MetricSlider
          to={0.72}
          startFrame={14}
          durationInFrames={34}
          width={780}
          leftLabel="MEN"
          rightLabel="WOMEN"
          handleLabel="72%"
          ticks={5}
        />
      </Centre>
    </Sequence>

    <Sequence from={95} durationInFrames={95}>
      <Label n="StaggerGrid" sub="ABSORBS 5 · CELLS ARRIVE IN ORDER" />
      <Centre>
        <div style={{ width: 800 }}>
          <StaggerGrid columns={2} gap={20} startFrame={10} staggerFrames={6} variant="pop">
            <Tile name="flood-04b" caption="UNTREATED" />
            <Tile name="flood-04a" caption="FACELIFT" />
            <Tile name="flood-05b" caption="UNTREATED" />
            <Tile name="flood-05a" caption="BLEPHAROPLASTY" />
          </StaggerGrid>
        </div>
      </Centre>
    </Sequence>

    <Sequence from={190} durationInFrames={100}>
      <Label n="AnimatedBarChart" sub="ABSORBS 4 · BADGES RIDE THE TIP" />
      <Centre>
        <AnimatedBarChart
          startFrame={12}
          width={720}
          height={340}
          bars={[
            { value: 0.86, label: "UNPIERCED" },
            { value: 0.58, label: "1 PIERCING" },
            { value: 0.34, label: "3+ PIERCINGS" },
          ]}
          renderBadge={(_b, i) => (
            <Face name={["flood-04a", "flood-05a", "flood-06a"][i]} />
          )}
        />
      </Centre>
    </Sequence>

    <Sequence from={290} durationInFrames={95}>
      <Label n="TargetReticle" sub="ABSORBS 4 · MACHINE LOCK-ON" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img src={portrait("hero2-before")} style={{ width: 620 }} />
      </AbsoluteFill>
      <TargetReticle
        x={352} y={690} width={376} height={300}
        startFrame={14} label="JAWLINE · MEASURING" crosshair
      />
    </Sequence>

    <Sequence from={385} durationInFrames={125}>
      <Label n="CardScrollStack" sub="CONTINUOUS MOTION · OURS IS 9.4%, REF-10 IS 64%" />
      <Centre>
        <CardScrollStack
          width={420}
          height={620}
          itemHeight={300}
          gap={16}
          startFrame={6}
          framesPerItem={34}
        >
          <Tile name="flood-06b" caption="TYPE 01 · ORIGINAL" />
          <Tile name="flood-06a" caption="TYPE 02 · REFINED" />
          <Tile name="flood-04b" caption="TYPE 03 · FULL" />
          <Tile name="flood-04a" caption="TYPE 04 · LIFTED" />
        </CardScrollStack>
      </Centre>
    </Sequence>
    <Sequence from={510} durationInFrames={95}>
      <Label n="DimensionCallout" sub="ABSORBS 5 - MEASURES BETWEEN TWO POINTS" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img src={portrait("hero2-before")} style={{ width: 620 }} />
      </AbsoluteFill>
      <DimensionCallout from={[398, 742]} to={[682, 742]} startFrame={12}
                        label="INTERPUPILLARY" />
      <DimensionCallout from={[540, 800]} to={[540, 962]} startFrame={26}
                        label="MIDFACE" style="solid" />
    </Sequence>

    <Sequence from={605} durationInFrames={95}>
      <Label n="DualCardLayout" sub="ABSORBS 6 - NAMED LAYOUT STATES" />
      <Centre>
        <DualCardLayout
          from="split"
          to="overlap-left"
          startFrame={22}
          cardWidth={360}
          cardHeight={470}
          a={<Tile name="flood-06b" caption="BEFORE" />}
          b={<Tile name="flood-06a" caption="AFTER" />}
        />
      </Centre>
    </Sequence>

    <Sequence from={700} durationInFrames={95}>
      <Label n="RadialFan" sub="ABSORBS 3 - ONE THING CONNECTS TO MANY" />
      <Centre>
        <RadialFan
          radius={210}
          startFrame={10}
          staggerFrames={4}
          spokes
          items={["flood-04a", "flood-05a", "flood-06a", "flood-04b", "flood-05b", "flood-06b"]
            .map((n) => <Face key={n} name={n} />)}
        />
      </Centre>
    </Sequence>

    <Sequence from={795} durationInFrames={120}>
      <Label n="InlineTextSwap" sub="ABSORBS 2 - IN PLACE, NO REFLOW" />
      <Centre>
        <div style={{ fontFamily: sansFont, fontSize: 62, color: "#fff" }}>
          Which{" "}
          <InlineTextSwap
            items={["nose", "jaw", "brow", "chin"]}
            hold={26}
            startFrame={10}
            style={{ fontWeight: 600 }}
          />{" "}
          are you?
        </div>
      </Centre>
    </Sequence>
    <Sequence from={915} durationInFrames={95}>
      <Label n="ScanOverlay" sub="5 REELS - A READ-HEAD SWEEPS THE REGION" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img src={portrait("hero2-before")} style={{ width: 620 }} />
      </AbsoluteFill>
      <ScanOverlay x={330} y={620} width={420} height={480} startFrame={10}
                   durationInFrames={55} label="ANALYSING" loop />
    </Sequence>

    <Sequence from={1010} durationInFrames={110}>
      <Label n="CardCarousel" sub="7 REELS - STEPPED, HORIZONTAL" />
      <Centre>
        <CardCarousel width={900} height={420} itemSize={300} axis="x"
                      mode="stepped" startFrame={8} framesPerItem={26} feather={60}>
          <Tile name="flood-04a" caption="ONE" />
          <Tile name="flood-05a" caption="TWO" />
          <Tile name="flood-06a" caption="THREE" />
          <Tile name="flood-04b" caption="FOUR" />
        </CardCarousel>
      </Centre>
    </Sequence>

    <Sequence from={1120} durationInFrames={110}>
      <Label n="CardStack" sub="3 REELS - DEPTH, NOT REPLACEMENT" />
      <Centre>
        <CardStack width={380} height={500} startFrame={8} framesPerCard={30}>
          <Tile name="flood-06b" caption="STUDY 01" />
          <Tile name="flood-05b" caption="STUDY 02" />
          <Tile name="flood-04b" caption="STUDY 03" />
        </CardStack>
      </Centre>
    </Sequence>

    <Sequence from={1230} durationInFrames={95}>
      <Label n="FaceMesh" sub="3 REELS - DIGITISED, NOT TRACED" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img src={portrait("hero2-before")} style={{ width: 620 }} />
      </AbsoluteFill>
      <FaceMesh cx={540} cy={860} rx={190} ry={250} startFrame={10} />
    </Sequence>

    <Sequence from={1325} durationInFrames={95}>
      <Label n="CitationCard" sub="4 REELS - THE ONLY RECURRING DEVICE" />
      <Centre>
        <CitationCard
          startFrame={10}
          title="The Influence of Facial Piercings on Perceptions of Attractiveness and Intelligence"
          source="Swami, V., Stieger, S., Pietschnig, J., Voracek, M., Furnham, A. & Tovee, M. (2012)"
          doi="Body Image 9(1)"
        />
      </Centre>
    </Sequence>

    <Sequence from={1420} durationInFrames={110}>
      <Label n="TypewriterInput" sub="OUR OWN PROTOCOL REEL ENDS ON THIS" />
      <Centre>
        <TypewriterInput text="Refina AI" startFrame={14} framesPerChar={5} />
      </Centre>
    </Sequence>

    <Sequence from={1530} durationInFrames={110}>
      <Label n="SyncProgressTimeline" sub="BAR AND MARKER SHARE ONE VALUE" />
      <Centre>
        <SyncProgressTimeline startFrame={10} durationInFrames={80} width={800}
                              stops={["Cleanse", "Treat", "Moisturise", "Protect"]} />
      </Centre>
    </Sequence>

    <Sequence from={1640} durationInFrames={95}>
      <Label n="NetworkGraph" sub="ARBITRARY EDGES, NOT A HUB" />
      <Centre>
        <NetworkGraph
          width={760} height={520} startFrame={8}
          nodes={[
            { id: "a", x: 380, y: 90, node: <Face name="flood-04a" /> },
            { id: "b", x: 140, y: 280, node: <Face name="flood-05a" /> },
            { id: "c", x: 620, y: 280, node: <Face name="flood-06a" /> },
            { id: "d", x: 380, y: 440, node: <Face name="flood-04b" /> },
          ]}
          edges={[["a", "b"], ["a", "c"], ["b", "d"], ["c", "d"], ["b", "c"]]}
        />
      </Centre>
    </Sequence>

    <Sequence from={1735} durationInFrames={95}>
      <Label n="Collage" sub="ACCUMULATES - THE COUNT IS THE ARGUMENT" />
      <Centre>
        <Collage width={860} height={620} itemWidth={230} itemHeight={300}
                 startFrame={8} staggerFrames={5}>
          <Tile name="flood-04a" /><Tile name="flood-05a" />
          <Tile name="flood-06a" /><Tile name="flood-04b" />
          <Tile name="flood-05b" /><Tile name="flood-06b" />
        </Collage>
      </Centre>
    </Sequence>

    <Sequence from={1830} durationInFrames={120}>
      <Label n="OverlayToggle" sub="LANDS ON THE SUBJECT AND STAYS" />
      <Centre>
        <OverlayToggle width={560} height={740} startFrame={10} framesPerItem={16}
          items={[
            { x: 0.36, y: 0.30, node: <Dot /> },
            { x: 0.64, y: 0.30, node: <Dot /> },
            { x: 0.50, y: 0.46, node: <Dot /> },
            { x: 0.30, y: 0.55, node: <Dot /> },
          ]}
        >
          <Img src={portrait("hero2-before")} style={{ width: 560 }} />
        </OverlayToggle>
      </Centre>
    </Sequence>
  </AbsoluteFill>
);

export const KitLab: React.FC = () => (
  <Composition
    id="KitLab"
    component={KitLabVideo}
    durationInFrames={1950}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{}}
  />
);
