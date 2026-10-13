import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useStationThumbnail } from "@/app/laundromat/use-station-thumbnail";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { fitCaptionFontSize } from "@/lib/laundromat/tv/fit-caption-font-size";
import { formatStation } from "@/lib/laundromat/tv/format-station";
import { TUNER_DETENTS } from "@/lib/laundromat/tv/tv-state";
import { cn } from "@/lib/utils";

import { BoxBevel } from "./box-bevel";
import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";
import type { TvView } from "./scene-views";

const SCANLINE_GAP = 2.5;
const GRILLE_GAP = 3;
const CAPTION_INSET = 6;
const SHELF = {
  thickness: 0.08,
  overhang: 0.1,
  bracketInset: 0.4,
  bracketReach: 0.75,
  bracketDrop: 1.5,
  bracketThickness: 0.05,
};

type TvDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlightedId: string | undefined;
  view: TvView;
  details: SceneConfig["details"]["tv"];
};

export function TvDrawing(props: TvDrawingProps) {
  const { copy } = useLaundromatCopy();
  const { object, faces, face } = props.laidOut;
  const { state: tv, noSignal } = props.view;
  const thumbnailUrl = useStationThumbnail(
    props.details.stations[tv.station]?.videoId
  );
  if (face?.target !== "tv") return null;
  const { projection, details } = props;
  const { position, size } = object;
  const { screen, grille, tuner, volume, power, body } = face.rects;
  const midY = position.y + size.d / 2;
  function isHighlighted(part: string) {
    return props.highlightedId === `${object.id}-${part}`;
  }
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const antennaBase = at(position.x + size.w / 2, midY, position.z + size.h);
  const antennaTips = [
    at(position.x + size.w / 2, midY + 0.8, position.z + size.h + 1.1),
    at(position.x + size.w / 2, midY - 0.7, position.z + size.h + 1.2),
  ];
  const tunerCenter = {
    x: tuner.x + tuner.width / 2,
    y: tuner.y + tuner.height / 2,
  };
  const tunerRadius = Math.min(tuner.width, tuner.height) / 2 - 3;
  const volumeCenter = {
    x: volume.x + volume.width / 2,
    y: volume.y + volume.height / 2,
  };
  const volumeRadius = Math.min(volume.width, volume.height) / 2 - 3;
  const glass = {
    x: screen.x + 3,
    y: screen.y + 3,
    width: screen.width - 6,
    height: screen.height - 6,
  };
  const screenCenter = {
    x: glass.x + glass.width / 2,
    y: glass.y + glass.height / 2,
  };
  const station = formatStation({
    index: tv.station,
    stations: details.stations,
    copy,
  });
  const credit = details.stations[tv.station]?.channel;
  const creditText = credit === undefined ? undefined : `${credit} · youtube`;
  const captionWidth = glass.width - 2 * CAPTION_INSET;
  const screenBox = {
    x: -glass.width / 2,
    y: -glass.height / 2,
    width: glass.width,
    height: glass.height,
  };
  const scanlineStyle: React.CSSProperties & { "--lm-scan-step": string } = {
    "--lm-scan-step": `${SCANLINE_GAP}px`,
    animation: `lm-scan-drift ${details.scanlineDriftSeconds}s linear infinite`,
  };
  const glassClipId = `${object.id}-glass`;
  const vignetteId = `${object.id}-vignette`;
  const staticId = `${object.id}-static`;

  return (
    <g data-tv={tv.on ? "on" : "off"} strokeLinejoin="round">
      <g className="stroke-[var(--lm-line)]">
        {[
          position.y + SHELF.bracketInset,
          position.y + size.d - SHELF.bracketInset,
        ].map((y) => {
          const bracketTop = position.z - SHELF.thickness;
          const wallTop = { x: position.x, z: bracketTop };
          const tip = {
            x: position.x + size.w * SHELF.bracketReach,
            z: bracketTop,
          };
          const foot = { x: position.x, z: bracketTop - SHELF.bracketDrop };
          function onBracket(corner: { x: number; z: number }, offset: number) {
            return projectIsoPoint({
              point: { x: corner.x, y: y + offset, z: corner.z },
              projection,
            });
          }
          const thickness = SHELF.bracketThickness;
          const back = [wallTop, tip, foot].map((corner) =>
            onBracket(corner, 0)
          );
          const front = [wallTop, tip, foot].map((corner) =>
            onBracket(corner, thickness)
          );
          const underside = [
            onBracket(tip, 0),
            onBracket(foot, 0),
            onBracket(foot, thickness),
            onBracket(tip, thickness),
          ];
          return (
            <g key={y}>
              <polygon
                className="fill-[var(--lm-face)]"
                points={toSvgPoints(back)}
              />
              <polygon
                className="fill-[var(--lm-wall)]"
                points={toSvgPoints(underside)}
              />
              <polygon
                className="fill-[var(--lm-face)]"
                points={toSvgPoints(front)}
              />
            </g>
          );
        })}
        <IsoBox
          position={{
            x: position.x,
            y: position.y - SHELF.overhang,
            z: position.z - SHELF.thickness,
          }}
          size={{
            w: size.w + SHELF.overhang,
            d: size.d + 2 * SHELF.overhang,
            h: SHELF.thickness,
          }}
          projection={projection}
          bevel={false}
        />
      </g>
      <g className={partStroke(props.highlightedId === object.id)}>
        <polygon
          className="fill-[var(--lm-face)]"
          points={toSvgPoints(faces.front)}
        />
        <polygon
          className="fill-[var(--lm-wall)]"
          points={toSvgPoints(faces.side)}
        />
        <polygon
          className="fill-[var(--lm-face-top)]"
          points={toSvgPoints(faces.top)}
        />
        <BoxBevel points={faces.bevel} />
        {antennaTips.map((tip) => (
          <g key={`${tip.x},${tip.y}`}>
            <line
              x1={antennaBase.x}
              y1={antennaBase.y}
              x2={tip.x}
              y2={tip.y}
              strokeWidth={0.75}
            />
            <circle
              cx={tip.x}
              cy={tip.y}
              r={1.1}
              className="fill-[var(--lm-face-top)]"
              strokeWidth={0.75}
            />
          </g>
        ))}
        <ellipse
          cx={antennaBase.x}
          cy={antennaBase.y}
          rx={5}
          ry={2.4}
          className="fill-[var(--lm-face-top)]"
        />
      </g>
      <g transform={face.transform} strokeWidth={1}>
        <rect
          x={body.x + 2}
          y={body.y + 2}
          width={body.width - 4}
          height={body.height - 4}
          rx={2}
          className="fill-none stroke-[var(--lm-detail)]"
        />
        <rect
          {...screen}
          rx={7}
          className={cn(
            "fill-[var(--lm-face-top)]",
            partStroke(isHighlighted("screen"))
          )}
        />
        <rect
          {...glass}
          rx={9}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        />
        <g transform={`translate(${screenCenter.x} ${screenCenter.y})`}>
          <g
            data-lm-motion
            style={{
              transform: tv.on ? "scale(1, 1)" : "scale(0.9, 0.01)",
              opacity: tv.on ? 1 : 0,
              transition: `transform ${details.powerMs}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${details.powerMs}ms ease-out`,
            }}
          >
            <defs>
              <clipPath id={glassClipId}>
                <rect {...screenBox} rx={9} />
              </clipPath>
              <radialGradient id={vignetteId} r="0.75">
                <stop
                  offset="0.55"
                  className="[stop-color:var(--lm-bg)]"
                  stopOpacity={0}
                />
                <stop
                  offset="1"
                  className="[stop-color:var(--lm-bg)]"
                  stopOpacity={1}
                />
              </radialGradient>
              <filter id={staticId} x="0" y="0" width="1" height="1">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.9"
                  numOctaves={1}
                  seed={tv.station}
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </defs>
            <g clipPath={`url(#${glassClipId})`} className="stroke-none">
              {thumbnailUrl === undefined || noSignal ? (
                <rect
                  {...screenBox}
                  className="fill-[var(--lm-accent)]"
                  opacity={details.screenGlow}
                />
              ) : (
                <>
                  <image
                    href={thumbnailUrl}
                    {...screenBox}
                    preserveAspectRatio="xMidYMid slice"
                    data-tv-thumbnail={thumbnailUrl}
                  />
                  <rect
                    {...screenBox}
                    className="fill-[var(--lm-bg)]"
                    opacity={details.thumbnailDim}
                  />
                </>
              )}
              {noSignal && (
                <rect
                  {...screenBox}
                  filter={`url(#${staticId})`}
                  opacity={0.35}
                />
              )}
              <g opacity={details.scanlineOpacity}>
                <g
                  data-lm-motion
                  className="stroke-[var(--lm-bg)]"
                  strokeWidth={0.75}
                  style={scanlineStyle}
                >
                  {Array.from(
                    { length: Math.ceil(glass.height / SCANLINE_GAP) + 1 },
                    (_, index) => {
                      const y = screenBox.y + (index - 1) * SCANLINE_GAP;
                      return (
                        <line
                          key={y}
                          x1={screenBox.x}
                          y1={y}
                          x2={screenBox.x + screenBox.width}
                          y2={y}
                        />
                      );
                    }
                  )}
                </g>
              </g>
              <rect
                {...screenBox}
                fill={`url(#${vignetteId})`}
                opacity={details.vignette}
              />
              <g opacity={details.flicker}>
                <rect
                  data-lm-motion
                  {...screenBox}
                  className="fill-[var(--lm-ink-hi)]"
                  style={{ animation: "lm-flicker 4.8s steps(12) infinite" }}
                />
              </g>
              <rect
                key={`static-${tv.station}`}
                data-lm-motion
                {...screenBox}
                filter={`url(#${staticId})`}
                opacity={0}
                style={{
                  animation: `lm-static ${details.staticMs}ms steps(4) forwards`,
                }}
              />
              {tv.on && (
                <rect
                  data-lm-motion
                  {...screenBox}
                  className="fill-[var(--lm-ink-hi)]"
                  opacity={0}
                  style={{ animation: "lm-power-flash 1.2s ease-out forwards" }}
                />
              )}
            </g>
            <g
              clipPath={`url(#${glassClipId})`}
              className="stroke-none font-[family-name:var(--lm-font-mono)] lowercase"
            >
              <text
                key={tv.station}
                x={screenBox.x + CAPTION_INSET}
                y={screenBox.y + 9}
                fontSize={fitCaptionFontSize({
                  text: station,
                  maxWidth: captionWidth,
                  maxFontSize: 5,
                })}
                className="fill-[var(--lm-accent-hi)]"
                style={{
                  animation: `lm-fade-out ${details.osdSeconds}s ease-out forwards`,
                }}
              >
                {station}
              </text>
              {noSignal ? (
                <text
                  x={0}
                  y={1.5}
                  fontSize={fitCaptionFontSize({
                    text: copy.tv.noSignal,
                    maxWidth: captionWidth,
                    maxFontSize: 5,
                  })}
                  textAnchor="middle"
                  className="fill-[var(--lm-ink-hi)]"
                >
                  {copy.tv.noSignal}
                </text>
              ) : (
                creditText !== undefined && (
                  <text
                    x={screenBox.x + CAPTION_INSET}
                    y={screenBox.y + screenBox.height - 5}
                    fontSize={fitCaptionFontSize({
                      text: creditText,
                      maxWidth: captionWidth,
                      maxFontSize: 3.5,
                    })}
                    className="fill-[var(--lm-ink-hi)]"
                    opacity={0.8}
                    data-tv-credit
                  >
                    {creditText}
                  </text>
                )
              )}
            </g>
          </g>
        </g>
        <path
          d={`M ${glass.x + 5} ${glass.y + glass.height * 0.45} Q ${glass.x + 5} ${glass.y + 5} ${glass.x + glass.width * 0.4} ${glass.y + 4}`}
          className="fill-none stroke-[var(--lm-ink-hi)]"
          strokeOpacity={details.reflection}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <g className="stroke-[var(--lm-detail)]" strokeWidth={0.75}>
          {Array.from(
            { length: Math.floor(grille.width / GRILLE_GAP) - 1 },
            (_, index) => {
              const x = grille.x + (index + 1) * GRILLE_GAP;
              return (
                <line
                  key={x}
                  x1={x}
                  y1={grille.y}
                  x2={x}
                  y2={grille.y + grille.height}
                />
              );
            }
          )}
        </g>
        <line
          x1={tuner.x - 2}
          y1={tuner.y}
          x2={tuner.x - 2}
          y2={body.height - 4}
          className="stroke-[var(--lm-detail)]"
          strokeWidth={0.75}
        />
        <g transform={`translate(${tunerCenter.x} ${tunerCenter.y})`}>
          {Array.from({ length: TUNER_DETENTS }, (_, index) => (
            <line
              key={index}
              x1={0}
              y1={-tunerRadius - 0.5}
              x2={0}
              y2={-tunerRadius - 2}
              transform={`rotate(${index * (360 / TUNER_DETENTS)})`}
              className={
                index < details.stations.length
                  ? "stroke-[var(--lm-ink)]"
                  : "stroke-[var(--lm-detail)]"
              }
              strokeWidth={0.75}
            />
          ))}
          <circle
            r={tunerRadius - 1}
            className={cn(
              "fill-[var(--lm-face-top)]",
              partStroke(isHighlighted("tuner"))
            )}
          />
          <circle
            r={tunerRadius - 3.5}
            className="fill-none stroke-[var(--lm-detail)]"
            strokeWidth={0.75}
          />
          <g
            data-lm-motion
            style={{
              transform: `rotate(${tv.station * (360 / TUNER_DETENTS)}deg)`,
              transition: "transform 180ms cubic-bezier(0.2, 0.9, 0.3, 1.15)",
            }}
          >
            <rect
              x={-1.25}
              y={-tunerRadius + 1}
              width={2.5}
              height={tunerRadius * 0.9}
              rx={1}
              className={cn(
                "fill-[var(--lm-face)]",
                partStroke(isHighlighted("tuner"))
              )}
              strokeWidth={0.75}
            />
          </g>
        </g>
        <g transform={`translate(${volumeCenter.x} ${volumeCenter.y})`}>
          <circle
            r={volumeRadius - 1}
            className={cn(
              "fill-[var(--lm-face-top)]",
              partStroke(isHighlighted("volume"))
            )}
          />
          <circle
            r={volumeRadius - 3}
            className="fill-none stroke-[var(--lm-detail)]"
            strokeWidth={0.75}
            strokeDasharray="0.8 1.6"
          />
          <g
            data-lm-motion
            style={{
              transform: `rotate(${-135 + tv.volumePercent * 2.7}deg)`,
              transition: "transform 180ms cubic-bezier(0.2, 0.9, 0.3, 1.15)",
            }}
          >
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={-volumeRadius + 2}
              className={partStroke(isHighlighted("volume"))}
              strokeWidth={1.25}
            />
          </g>
        </g>
        <g
          transform={`translate(${power.x + power.width / 2} ${power.y + power.height / 2})`}
        >
          <rect
            x={-5}
            y={-2.5}
            width={8}
            height={5}
            rx={1}
            className={cn(
              "fill-[var(--lm-face-top)]",
              partStroke(isHighlighted("power"))
            )}
          />
          <circle
            cx={7}
            cy={0}
            r={1.2}
            className={cn(
              "stroke-none",
              tv.on ? "fill-[var(--lm-accent)]" : "fill-[var(--lm-detail)]"
            )}
          />
        </g>
      </g>
    </g>
  );
}
