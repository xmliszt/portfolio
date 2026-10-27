type LinearRgb = [number, number, number];

type SunsetPalette = {
  zenith: LinearRgb;
  mid: LinearRgb;
  horizon: LinearRgb;
  sun: LinearRgb;
  sea: LinearRgb;
};

type HexPalette = {
  zenith: string;
  mid: string;
  horizon: string;
  sun: string;
  sea: string;
};

const HALF_SET_AT = 1 / 6;

const DUSK = linearise({
  zenith: "#161b29",
  mid: "#3a3049",
  horizon: "#7e3f33",
  sun: "#ff7a3a",
  sea: "#0b0e16",
});

const HALF_SET = linearise({
  zenith: "#5f6680",
  mid: "#c4876c",
  horizon: "#f2772d",
  sun: "#ffb35c",
  sea: "#1f1f29",
});

const GOLDEN = linearise({
  zenith: "#8a90a1",
  mid: "#d8b49c",
  horizon: "#f4d0a0",
  sun: "#fff0d2",
  sea: "#363846",
});

/** Return the scene colours in linear RGB for `colourKey` (0 = dusk, 1/6 = sun half set, 1 = golden hour), blended between the nearest two keys. */
export function getSunsetPalette(colourKey: number) {
  if (colourKey < HALF_SET_AT)
    return blend({ from: DUSK, to: HALF_SET, t: colourKey / HALF_SET_AT });
  return blend({
    from: HALF_SET,
    to: GOLDEN,
    t: Math.min((colourKey - HALF_SET_AT) / (1 - HALF_SET_AT), 1),
  });
}

function linearise(palette: HexPalette): SunsetPalette {
  return {
    zenith: toLinearRgb(palette.zenith),
    mid: toLinearRgb(palette.mid),
    horizon: toLinearRgb(palette.horizon),
    sun: toLinearRgb(palette.sun),
    sea: toLinearRgb(palette.sea),
  };
}

function toLinearRgb(hex: string): LinearRgb {
  const channel = (offset: number) =>
    (parseInt(hex.slice(offset, offset + 2), 16) / 255) ** 2.2;
  return [channel(1), channel(3), channel(5)];
}

function blend(options: {
  from: SunsetPalette;
  to: SunsetPalette;
  t: number;
}): SunsetPalette {
  const mix = (a: LinearRgb, b: LinearRgb): LinearRgb => [
    a[0] + (b[0] - a[0]) * options.t,
    a[1] + (b[1] - a[1]) * options.t,
    a[2] + (b[2] - a[2]) * options.t,
  ];
  return {
    zenith: mix(options.from.zenith, options.to.zenith),
    mid: mix(options.from.mid, options.to.mid),
    horizon: mix(options.from.horizon, options.to.horizon),
    sun: mix(options.from.sun, options.to.sun),
    sea: mix(options.from.sea, options.to.sea),
  };
}
