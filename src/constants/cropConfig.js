import { CROP_MODES } from "./cropModes";

export const GLOBAL_PREVIEW_ID = "GLOBAL_DEFAULT_PREVIEW_MASTER";

export const DEFAULT_CROP_CONFIG = {
  mode: CROP_MODES.FREE,
  aspectRatio: 1,
  targetSize: { width: 0, height: 0 },
  selection: { x: 0, y: 0, width: 0, height: 0 },
  resolution: 72,
  transform: [1, 0, 0, 1, 0, 0],
};
