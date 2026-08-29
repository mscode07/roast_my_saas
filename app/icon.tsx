import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "64px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111111",
        borderRadius: "18px",
        padding: "0 4px 4px 0",
      }}
    >
      <div
        style={{
          width: "54px",
          height: "54px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d92736",
          borderRadius: "50% 50% 48% 22%",
        }}
      >
        <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
          <path
            d="M18.2 2.5c1.7 7.3-4.8 9.2-2.1 15.4 1.2-3.2 3.8-4.8 6.2-7.2 6.5 6.7 9.1 12.1 7.5 18.1C28.3 34.3 23.5 38 17 38 9.2 38 3 32.3 3 24.9c0-6.1 3.8-10.1 8.7-14.9-.3 4.4 1 6.5 2.5 7.9C13.7 10.8 18.2 8.2 18.2 2.5Z"
            fill="white"
          />
        </svg>
      </div>
    </div>,
    size,
  );
}
