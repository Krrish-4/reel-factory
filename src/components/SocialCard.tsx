import { sansFont } from "../fonts";

export const SocialCard: React.FC<{
  username: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ username, style, children }) => {
  return (
    <div
      style={{
        width: 320,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "white",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        fontFamily: sansFont,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)",
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>
          {username}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#d9d9d9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8a8a8a",
          fontSize: 14,
          textAlign: "center",
          padding: 16,
        }}
      >
        {children}
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          padding: "10px 14px",
          fontSize: 20,
          color: "#111",
        }}
      >
        <span>&#9825;</span>
        <span>&#9675;</span>
        <span>&#9651;</span>
      </div>
    </div>
  );
};
