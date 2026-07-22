export interface WindowState {
  x: number;
  y: number;
  width: string | number;
  height: string | number;
}

let topZIndex = 30;

export const getNextZIndex = (): number => {
  topZIndex += 1;
  return topZIndex;
};

/**
 * Validates if the window position is within visible viewport bounds.
 * If outside visible screen limits, resets x and y to 0 (centered position).
 */
export const validateAndCenterPosition = (
  state: WindowState,
  defaultWidth: string | number = '100%',
  defaultHeight: string | number = '100%'
): WindowState => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Calculate numeric dimensions if possible
  let numericWidth = typeof state.width === 'number' ? state.width : viewportWidth * 0.9;
  let numericHeight = typeof state.height === 'number' ? state.height : viewportHeight * 0.85;

  if (typeof state.width === 'string' && state.width.endsWith('%')) {
    numericWidth = (parseFloat(state.width) / 100) * viewportWidth;
  }
  if (typeof state.height === 'string' && state.height.endsWith('%')) {
    numericHeight = (parseFloat(state.height) / 100) * viewportHeight;
  }

  // Ensure dimensions stay within realistic bounds
  numericWidth = Math.max(380, Math.min(viewportWidth, numericWidth));
  numericHeight = Math.max(300, Math.min(viewportHeight, numericHeight));

  // Check if position (x, y) keeps window readable inside viewport
  // x offset shouldn't push the window completely off left or right
  const maxX = Math.max(100, (viewportWidth - 200) / 2);
  const maxY = Math.max(100, (viewportHeight - 150) / 2);

  const isOutOfX = state.x < -maxX || state.x > maxX;
  const isOutOfY = state.y < -maxY || state.y > maxY;

  if (isOutOfX || isOutOfY) {
    return {
      x: 0,
      y: 0,
      width: state.width || defaultWidth,
      height: state.height || defaultHeight,
    };
  }

  return {
    x: state.x,
    y: state.y,
    width: state.width || defaultWidth,
    height: state.height || defaultHeight,
  };
};

/**
 * Retrieves window state from localStorage, restoring position & dimensions.
 */
export const getStoredWindowState = (
  storageKey: string,
  defaultWidth: string | number = '100%',
  defaultHeight: string | number = '100%'
): WindowState => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const state: WindowState = {
          x: typeof parsed.x === 'number' ? parsed.x : 0,
          y: typeof parsed.y === 'number' ? parsed.y : 0,
          width: parsed.width ?? defaultWidth,
          height: parsed.height ?? defaultHeight,
        };
        return validateAndCenterPosition(state, defaultWidth, defaultHeight);
      }
    }
  } catch (err) {
    console.warn(`Failed to read window state for ${storageKey}:`, err);
  }

  return { x: 0, y: 0, width: defaultWidth, height: defaultHeight };
};

/**
 * Saves window state (x, y, width, height) to localStorage.
 */
export const saveWindowState = (storageKey: string, state: WindowState): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (err) {
    console.warn(`Failed to save window state for ${storageKey}:`, err);
  }
};
