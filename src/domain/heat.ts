/**
 * Heat guidance for outdoor training in Bangkok.
 *
 * There is no weather service connected to this site. Rather than
 * inventing an integration, the person enters the temperature and
 * humidity they can see on their own phone, and this file turns that
 * into advice. When nothing has been entered, the site says so.
 */

export type HeatBand = 'unknown' | 'ok' | 'caution' | 'high' | 'extreme';

export interface HeatConditions {
  temp_c: number | null;
  humidity_pct: number | null;
  /** When the reading was entered, ISO timestamp. */
  entered_at: string | null;
}

export interface HeatAdvice {
  band: HeatBand;
  label: string;
  summary: string;
  actions: string[];
  /** Rough "feels like" figure, only when both inputs are present. */
  heat_index_c: number | null;
}

/**
 * Simplified heat index. Uses the standard Rothfusz regression,
 * converted to Celsius. Only valid at warmer temperatures, which is
 * the only range that matters here.
 */
export function heatIndexC(tempC: number, humidity: number): number {
  const t = (tempC * 9) / 5 + 32;
  const r = humidity;
  if (t < 80) return tempC;
  let hi =
    -42.379 +
    2.04901523 * t +
    10.14333127 * r -
    0.22475541 * t * r -
    0.00683783 * t * t -
    0.05481717 * r * r +
    0.00122874 * t * t * r +
    0.00085282 * t * r * r -
    0.00000199 * t * t * r * r;
  if (r < 13 && t >= 80 && t <= 112) hi -= ((13 - r) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  if (r > 85 && t >= 80 && t <= 87) hi += ((r - 85) / 10) * ((87 - t) / 5);
  return Math.round((((hi - 32) * 5) / 9) * 10) / 10;
}

export function assessHeat(c: HeatConditions): HeatAdvice {
  if (c.temp_c == null || c.humidity_pct == null) {
    return {
      band: 'unknown',
      label: 'No conditions entered',
      heat_index_c: null,
      summary:
        'This site does not connect to a weather service, so it cannot tell you the temperature. Check your phone and enter the temperature and humidity to get advice for today.',
      actions: [
        'Train after sunset when you can - it is the single biggest difference in Bangkok.',
        'Take water with you regardless of the reading.',
      ],
    };
  }

  const hi = heatIndexC(c.temp_c, c.humidity_pct);
  const base = [
    'Wear light, loose, breathable clothing.',
    'Plan a route where you can refill water or buy a cold drink.',
  ];

  if (hi < 30) {
    return {
      band: 'ok',
      label: 'Comfortable',
      heat_index_c: hi,
      summary: 'Reasonable conditions for running. Normal precautions are enough.',
      actions: [...base, 'Drink to thirst on runs under an hour.'],
    };
  }
  if (hi < 35) {
    return {
      band: 'caution',
      label: 'Warm - take care',
      heat_index_c: hi,
      summary:
        'Warm enough to slow you down. Expect the same pace to feel harder than usual, and let it.',
      actions: [
        ...base,
        'Slow your pace and use the talk test rather than chasing a time.',
        'Drink at regular intervals rather than waiting until you are thirsty.',
        'Shorten the run if you feel unusually hot early on.',
      ],
    };
  }
  if (hi < 41) {
    return {
      band: 'high',
      label: 'Hot - shorten or move indoors',
      heat_index_c: hi,
      summary:
        'These are conditions where heat illness becomes a real risk during sustained exercise.',
      actions: [
        'Move the run to after dark, or do the indoor alternative instead.',
        'If you do go out, cut the duration by about half and keep the effort easy.',
        'Carry water and drink regularly. On a long, heavy-sweating session, something with salt in it helps - plain water alone over several hours is not ideal.',
        'Stop immediately if you feel dizzy, stop sweating, get a headache, or feel confused.',
      ],
    };
  }
  return {
    band: 'extreme',
    label: 'Do not run outside',
    heat_index_c: hi,
    summary:
      'This is too hot for outdoor training. Use the indoor alternative - the workout still counts.',
    actions: [
      'Do the indoor cardio swap in an air-conditioned room.',
      'Reschedule outdoor running to a much cooler time of day.',
    ],
  };
}

/** Signs that mean stop now. Shown on the heat page and before outdoor sessions. */
export const HEAT_WARNING_SIGNS = [
  'Feeling faint, dizzy, or weak',
  'Confusion, or difficulty concentrating',
  'Stopping sweating while still hot',
  'Headache, nausea, or vomiting',
  'Muscle cramps that will not settle',
  'Skin that is hot and dry, or very flushed',
];

export const HEAT_EMERGENCY_TEXT =
  'Stop, get into shade or air conditioning, remove excess clothing, sip water, and cool the skin with water. If there is confusion, collapse, or the person cannot drink, call 1669 immediately - that is a medical emergency.';

/**
 * Heat adaptation takes one to two weeks of gradually longer easy
 * sessions in the heat. There is no way to rush it.
 */
export const HEAT_ADAPTATION_NOTE =
  'If you mostly train in air conditioning, your body will not be used to the heat. Build outdoor running up over 10-14 days, starting with short easy sessions, rather than doing a long run on your first hot evening.';

export const OVERHYDRATION_NOTE =
  'Drinking far more water than you lose is also harmful. On sessions under an hour, drinking to thirst is enough. You do not need to force litres of water down before a run.';
