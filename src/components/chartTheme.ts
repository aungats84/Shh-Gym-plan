/**
 * Chart colours, drawn from the Blush palette.
 *
 * Only one chart on the site plots two series at once (the weight
 * chart: a weekly-average line over single weigh-in dots), so the
 * palette needs one distinguishable pair rather than a long ramp.
 * That pair was run through the colour checks - lightness band,
 * chroma floor, colour-blind separation, normal-vision separation and
 * contrast against the chart surface - and passes in both modes.
 *
 * Slots 2 and 3 are only ever used on single-series charts, where
 * nothing sits next to them to be confused with.
 *
 * Dark mode uses its own steps. The palette is explicit that rose goes
 * muddy on a dark ground, so the dark pair is lifted accordingly.
 */

import { useEffect, useState } from 'react';

export const SERIES_LIGHT = ['#d9637f', '#4f7a31', '#8a5a12', '#6b4d52'] as const;
export const SERIES_DARK = ['#db6c88', '#79994a', '#e0a13a', '#a49093'] as const;

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
  grid: '#ece2e2',
  axis: '#a49093',
  surface: '#ffffff',
  text: '#2a1c1f',
  muted: '#665358',
  reference: '#a49093',
};

const DARK: ChartTheme = {
  series: SERIES_DARK,
  grid: '#3a2a2f',
  axis: '#847074',
  surface: '#2a1c1f',
  text: '#fbf7f6',
  muted: '#c3b2b4',
  reference: '#847074',
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
