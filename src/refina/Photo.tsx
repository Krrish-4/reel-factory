import { Img, staticFile } from "remotion";

/**
 * A real photo from public/, cover-fitted to its container.
 * `focusY` biases the crop vertically (0 = top, 0.5 = center).
 */
export const Photo: React.FC<{
  src: string;
  focusY?: number;
  style?: React.CSSProperties;
}> = ({ src, focusY = 0.32, style }) => {
  return (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: `50% ${focusY * 100}%`,
        ...style,
      }}
    />
  );
};
