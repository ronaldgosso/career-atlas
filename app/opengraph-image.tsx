import { ImageResponse } from "next/og";

export const alt = "Career Atlas — Executive Talent & Career Intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #020617 0%, #07131e 50%, #022c22 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "white",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Subtle grid border overlay */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            border: "1px solid rgba(20, 184, 166, 0.25)",
            borderRadius: "28px",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(20, 184, 166, 0.15)",
            border: "1px solid rgba(45, 212, 191, 0.35)",
            borderRadius: "999px",
            padding: "8px 24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#2dd4bf",
            }}
          />
          <span style={{ fontSize: "18px", color: "#5eead4", fontWeight: 700, letterSpacing: "1px" }}>
            EXECUTIVE TALENT ADVISORY & DOSSIERS
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 900,
            letterSpacing: "-2px",
            margin: "0 0 16px 0",
            background: "linear-gradient(to right, #ffffff, #5eead4, #38bdf8)",
            backgroundClip: "text",
            color: "transparent",
            textAlign: "center",
          }}
        >
          Career Atlas
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "24px",
            color: "rgba(204, 251, 241, 0.8)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            margin: "0 0 32px 0",
          }}
        >
          Market-calibrated hiring compensation, capstone projects, verified masterclasses, & skill roadmaps.
        </p>

        {/* Footnote tags */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            color: "rgba(94, 234, 212, 0.7)",
            fontSize: "16px",
          }}
        >
          <span>🌍 55+ Global Talent Hubs</span>
          <span>•</span>
          <span>⚡ Zero-Network Offline Vault</span>
          <span>•</span>
          <span>📄 Instant PDF Dossiers</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
