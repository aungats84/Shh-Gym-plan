/**
 * Chart colours.
 *
 * These two palettes were validated with the data-visualisation
 * colour checks: lightness band, chroma floor, colour-blind
 * separation, normal-vision separation, and contrast against the
 * chart surface. Both pass every check in their own mode.
 *
 * Dark mode uses its own steps rather than lightening the light ones,
 * because an automatic flip does not stay legible.
 *
 * Hues are assigned in a fixed order and never cycled. If a chart
 * ever needs a fifth series, it should become two charts instead.
 */

import { useEffect, useState } from 'react';

export const SERIES_LIGHT = ['#00805c', '#b25f00', '#4f63c8', '#9d2a6a'] as const;
export const SERIES_DARK = ['#22a077', '#bd7d2c', '#7182d6', '#c65f8d'] as const;

export interface ChartTheme {
  series: readonly string[];
  grid: string;
  axis: string;
  surface: string;
  text: string;
  muted: string;
  reference: string;
}

const LIGHT: ChartTheme = {
  series: SERIES_LIGHT,
  grid: '#e7ebe9',
  axis: '#8b9793',
  surface: '#ffffff',
  text: '#14201e',
  muted: '#55625e',
  reference: '#8b9793',
};

const DARK: ChartTheme = {
  series: SERIES_DARK,
  grid: '#2d3b37',
  axis: '#77837f',
  surface: '#18221f',
  text: '#e7eeeb',
  muted: '#9aa7a3',
  reference: '#77837f',
};

/** Re-reads the theme whenever the dark class on <html> changes. */
export function useChartTheme(): ChartTheme {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return dark ? DARK : LIGHT;
}
