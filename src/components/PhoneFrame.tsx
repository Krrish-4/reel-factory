export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
}> = ({ children, width = 340, style }) => {
  const height = width * (844 / 390);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 46,
        border: "6px solid white",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        overflow: "hidden",
        position: "relative",
        background: "#000",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: width * 0.28,
          height: 18,
          background: "white",
          borderRadius: 12,
          zIndex: 2,
        }}
      />
      {children}
    </div>
  );
};
