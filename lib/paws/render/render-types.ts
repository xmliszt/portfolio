export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

export type AnyContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

/** Makes a blank canvas of `width` by `height` device pixels. */
export type CreateCanvas = (options: {
  width: number;
  height: number;
}) => AnyCanvas;

/** A 2D context and how many CSS pixels one unit of its current transform covers. */
export type DrawContext = { g: AnyContext; unitPx: number };

/** Places the world on screen: a world point `x, y` lands at CSS pixel `offsetX + x * scale, offsetY + y * scale`. */
export type WorldView = { scale: number; offsetX: number; offsetY: number };

export type ScenePrint =
  | {
      kind: "paw";
      x: number;
      y: number;
      angle: number;
      scale: number;
      color: string;
      variant: number;
      bornAt: number;
    }
  | {
      kind: "nose";
      x: number;
      y: number;
      angle: number;
      scale: number;
      color: string;
      bornAt: number;
    }
  | { kind: "finger"; x: number; y: number; pressure: number; bornAt: number };

/** A fingertip under the glass as one screen sees it, eased so it fades in, lowers and presses smoothly. */
export type FingertipState = {
  x: number;
  y: number;
  /** World units moved in the last step, for the smear of a dragged print. */
  dx: number;
  dy: number;
  speed: number;
  /** Height above the glass: 9 hovering, 0 pressed. */
  height: number;
  /** 0 hidden to 1 shown. */
  visibility: number;
  /** 0 lifted to 1 pressed. */
  press: number;
};

/** Whose fingertip it is: the viewer's or another visitor's. */
export type FingertipKind = "own" | "remote";

export type SceneFinger = FingertipState & { kind: FingertipKind };
