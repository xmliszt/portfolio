import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { fitCaptionFontSize } from "@/lib/laundromat/tv/fit-caption-font-size";
import { getCaptionWidthEm } from "@/lib/laundromat/tv/get-caption-width-em";
import { AQI_BAND_COLORS } from "@/lib/laundromat/weather/aqi-band-colors";
import { formatTemperature } from "@/lib/laundromat/weather/format-temperature";
import { getAqiBand } from "@/lib/laundromat/weather/get-aqi-band";
import { getWeatherConditionName } from "@/lib/laundromat/weather/get-weather-condition-name";
import type { WeatherPanelRects } from "@/lib/laundromat/weather/get-weather-panel-face";
import type { WeatherReading } from "@/lib/laundromat/weather/weather-reading";
import { cn } from "@/lib/utils";

import { WeatherGlyph } from "./weather-glyph";

const GLYPH_BOX = 24;
const SCREW_RADIUS = 0.55;
const OFF_OPACITY = 0.18;

type WeatherPanelFaceProps = {
  rects: WeatherPanelRects;
  weather: WeatherReading | undefined;
  animated: boolean;
  glyphMotionSeconds: number;
};

/** Draw the weather panel's chin, screws, status light and screen with its reading, in the face-pixel frame of `rects`. */
export function WeatherPanelFace(props: WeatherPanelFaceProps) {
  const { copy } = useLaundromatCopy();
  const { weather } = props;
  const { screen, reading, glyph, range, chin, body } = props.rects;
  const cityText = (() => {
    if (weather === undefined) return copy.weatherPanel.offTooltip;
    return weather.city ?? copy.weatherPanel.outside;
  })();
  const conditionName =
    weather === undefined
      ? undefined
      : getWeatherConditionName({ reading: weather, copy });
  const temperature =
    weather === undefined
      ? "--°"
      : formatTemperature({
          celsius: weather.temperatureC,
          unit: weather.unit,
        });
  const textInset = 1;
  const glyphScale = Math.min(glyph.width, glyph.height * 0.6) / GLYPH_BOX;
  const glyphCenter = {
    x: glyph.x + glyph.width / 2,
    y: glyph.y + glyph.height * 0.5,
  };
  const air = (() => {
    if (weather?.aqi === undefined) return undefined;
    const text = `${copy.weatherPanel.aqi} ${weather.aqi}`;
    const fontSize = 3.8;
    const right = glyph.x + glyph.width;
    return {
      text,
      fontSize,
      right,
      y: glyph.y + 3.5,
      dotX: right - fontSize * getCaptionWidthEm(text) - 2.2,
      color: AQI_BAND_COLORS[getAqiBand(weather.aqi)],
    };
  })();
  const rangeRow = (() => {
    if (weather === undefined) return undefined;
    const low = `${copy.weatherPanel.low} ${formatTemperature({ celsius: weather.lowC, unit: weather.unit })}`;
    const high = `${copy.weatherPanel.high} ${formatTemperature({ celsius: weather.highC, unit: weather.unit })}`;
    const fontSize = 4.2;
    const labelWidth =
      fontSize * Math.max(getCaptionWidthEm(low), getCaptionWidthEm(high));
    const barFrom = range.x + reading.x - screen.x + labelWidth + 3;
    const barTo =
      range.x + range.width - (reading.x - screen.x) - labelWidth - 3;
    const spread = weather.highC - weather.lowC;
    const nowRatio =
      spread <= 0
        ? 0.5
        : Math.min(
            1,
            Math.max(0, (weather.temperatureC - weather.lowC) / spread)
          );
    return {
      low,
      high,
      fontSize,
      barFrom,
      barTo,
      nowX: barFrom + (barTo - barFrom) * nowRatio,
      y: range.y + range.height / 2 + 0.5,
    };
  })();
  const screws = [
    { x: chin.x + chin.height / 2 + 1, y: chin.y + chin.height / 2 },
    {
      x: chin.x + chin.width - chin.height / 2 - 1,
      y: chin.y + chin.height / 2,
    },
  ];

  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <line
        x1={body.x}
        y1={chin.y}
        x2={body.x + body.width}
        y2={chin.y}
        className="stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
        strokeLinecap="butt"
      />
      {screws.map((screw) => (
        <g key={screw.x}>
          <circle
            cx={screw.x}
            cy={screw.y}
            r={SCREW_RADIUS * 2}
            className="fill-none stroke-[var(--lm-detail)]"
            strokeWidth={0.5}
          />
          <circle
            cx={screw.x}
            cy={screw.y}
            r={SCREW_RADIUS}
            className="fill-[var(--lm-line)] stroke-none"
          />
        </g>
      ))}
      <circle
        cx={chin.x + chin.width - chin.height * 2}
        cy={chin.y + chin.height / 2}
        r={1.1}
        className={cn(
          "stroke-none",
          weather === undefined
            ? "fill-[var(--lm-detail)]"
            : "fill-[var(--lm-accent)]"
        )}
      />
      <rect
        {...screen}
        rx={2.5}
        className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
      <g className="stroke-none font-[family-name:var(--lm-font-mono)] lowercase">
        <text
          x={reading.x + textInset}
          y={reading.y + 4}
          fontSize={fitCaptionFontSize({
            text: cityText,
            maxWidth: reading.width - textInset,
            maxFontSize: 4.6,
          })}
          className="fill-[var(--lm-ink)]"
        >
          {cityText}
        </text>
        {air !== undefined && (
          <>
            <circle
              cx={air.dotX}
              cy={air.y - air.fontSize * 0.32}
              r={1.1}
              style={{ fill: air.color }}
            />
            <text
              x={air.right}
              y={air.y}
              textAnchor="end"
              fontSize={air.fontSize}
              className="fill-[var(--lm-ink)] normal-case"
            >
              {air.text}
            </text>
          </>
        )}
        {conditionName !== undefined && (
          <text
            x={glyphCenter.x}
            y={glyph.y + glyph.height - 1}
            textAnchor="middle"
            fontSize={fitCaptionFontSize({
              text: conditionName,
              maxWidth: glyph.width,
              maxFontSize: 4.2,
            })}
            className="fill-[var(--lm-ink)]"
          >
            {conditionName}
          </text>
        )}
      </g>
      <text
        x={reading.x}
        y={reading.y + reading.height - 1}
        fontSize={reading.height * 0.66}
        className="fill-[var(--lm-ink-hi)] stroke-none font-[family-name:var(--lm-font-display)] tabular-nums"
        opacity={weather === undefined ? OFF_OPACITY : 1}
      >
        {temperature}
      </text>
      {weather !== undefined && (
        <g
          transform={`translate(${glyphCenter.x} ${glyphCenter.y}) scale(${glyphScale})`}
        >
          <WeatherGlyph
            condition={weather.condition}
            isDay={weather.isDay}
            animated={props.animated}
            motionSeconds={props.glyphMotionSeconds}
          />
        </g>
      )}
      <line
        x1={screen.x}
        y1={range.y}
        x2={screen.x + screen.width}
        y2={range.y}
        className="stroke-[var(--lm-detail)]"
        strokeWidth={0.5}
      />
      {rangeRow !== undefined && (
        <g>
          <g
            className="fill-[var(--lm-ink)] stroke-none font-[family-name:var(--lm-font-mono)] tabular-nums"
            fontSize={rangeRow.fontSize}
          >
            <text
              x={reading.x + textInset}
              y={rangeRow.y}
              dominantBaseline="central"
            >
              {rangeRow.low}
            </text>
            <text
              x={range.x + range.width - (reading.x - screen.x)}
              y={rangeRow.y}
              dominantBaseline="central"
              textAnchor="end"
            >
              {rangeRow.high}
            </text>
          </g>
          <line
            x1={rangeRow.barFrom}
            y1={rangeRow.y}
            x2={rangeRow.barTo}
            y2={rangeRow.y}
            className="stroke-[var(--lm-detail)]"
            strokeWidth={1.6}
          />
          <line
            x1={rangeRow.barFrom}
            y1={rangeRow.y}
            x2={rangeRow.nowX}
            y2={rangeRow.y}
            className="stroke-[var(--lm-ink)]"
            strokeWidth={1.6}
          />
          <circle
            cx={rangeRow.nowX}
            cy={rangeRow.y}
            r={1.6}
            className="fill-[var(--lm-accent-hi)] stroke-[var(--lm-recess)]"
            strokeWidth={0.75}
          />
        </g>
      )}
    </g>
  );
}
