import { ImageResponse } from "next/og";

import { sceneConfig } from "@/lib/laundromat/scene-config";

export const alt = "Laundromat: a quiet laundromat in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WASHER_COUNT = 4;

export default function OpengraphImage() {
  const tokens = sceneConfig.tokens;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: tokens.bg,
          color: tokens.ink,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", gap: 28 }}>
          {Array.from({ length: WASHER_COUNT }, (_, index) => (
            <div
              key={index}
              style={{
                width: 150,
                height: 190,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 26,
                paddingTop: 18,
                borderRadius: 10,
                background: tokens.face,
                border: `3px solid ${tokens.line}`,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: index === 1 ? tokens.accent : tokens.detail,
                  }}
                />
                <div
                  style={{
                    width: 54,
                    height: 8,
                    borderRadius: 2,
                    background: tokens.detail,
                  }}
                />
              </div>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  background: tokens.recess,
                  border: `4px solid ${tokens.ink}`,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 88, color: tokens.inkHi, letterSpacing: -2 }}>
            Laundromat
          </div>
          <div style={{ fontSize: 30 }}>
            Do your laundry, play lo-fi on the TV, leave a note.
          </div>
        </div>
      </div>
    ),
    size
  );
}
