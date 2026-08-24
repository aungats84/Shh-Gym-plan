/**
 * Evidence used by this site.
 *
 * Every entry below was checked by opening it during the build on
 * 24 August 2026. Nothing here is invented. If a link stops working,
 * that is link rot, not a fabricated citation - search the title.
 */

export interface Source {
  id: string;
  title: string;
  organisation: string;
  url: string;
  /** When the source itself was published or last updated. */
  published: string;
  /** When this site last checked the link. */
  reviewed: string;
  /** Which parts of the site rely on it. */
  used_for: string[];
}

export const SOURCE_REVIEW_DATE = '2026-08-24';

export const SOURCES: Source[] = [
  {
    id: 'acsm_rt_2026',
    title: 'ACSM Position Stand on Resistance Training (2026 update)',
    organisation:
      'American College of Sports Medicine, published in Medicine & Science in Sports & Exercise',
    url: 'https://acsm.org/resistance-training-guidelines-update-2026/',
    published: '17 March 2026',
    reviewed: SOURCE_REVIEW_DATE,
    used_for: [
      'Training every major muscle group at least twice a week',
      'Roughly 10 sets per muscle group per week as a volume guide',
      'Not requiring training to failure',
      'Home and bodyweight training being effective without a gym',
    ],
  },
  {
    id: 'parq_plus',
    title: 'PAR-Q+ (Physical Activity Readiness Questionnaire for Everyone) and ePARmed-X+',
    organisation: 'PAR-Q+ Collaboration',
    url: 'https://eparmedx.com/',
    published: '2025 edition',
    reviewed: SOURCE_REVIEW_DATE,
    used_for: [
      'The readiness screening step before the first workout',
      'Referring to a professional rather than giving clearance in-app',
    ],
  },
  {
    id: 'ioc_reds_2023',
    title:
      "2023 International Olympic Committee's consensus statement on Relative Energy Deficiency in Sport (REDs)",
    organisation: 'International Olympic Committee, British Journal of Sports Medicine',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37752011/',
    published: 'September 2023',
    reviewed: SOURCE_REVIEW_DATE,
    used_for: [
      'The signs watched for by the under-fuelling monitor',
      'Pausing the calorie deficit instead of diagnosing anything',
      'Referring to a doctor or sports dietitian',
    ],
  },
  {
    id: 'sleep_consensus_2021',
    title: 'Sleep and the athlete: narrative review and 2021 expert consensus recommendations',
    organisation: 'British Journal of Sports Medicine',
    url: 'https://doi.org/10.1136/bjsports-2020-102025',
    published: '2021',
    reviewed: SOURCE_REVIEW_DATE,
    used_for: [
      'Sleep duration and consistency guidance',
      'Caffeine timing relative to bedtime',
      'Treating consumer sleep trackers as estimates rather than measurements',
    ],
  },
  {
    id: 'cdc_heat_athletes',
    title: 'Heat and Athletes',
    organisation: 'US Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov/heat-health/risk-factors/heat-and-athletes.html',
    published: 'CDC Heat Health guidance',
    reviewed: SOURCE_REVIEW_DATE,
    used_for: [
      'Heat illness warning signs',
      'Gradual heat adaptation over 10-14 days',
      'Adjusting intensity and timing in hot conditions',
    ],
  },
  {
    id: 'thai_fbdg',
    title: 'Food-based dietary guidelines - Thailand (the Nutrition Flag)',
    organisation: 'Food and Agriculture Organization of the United Nations',
    url: 'https://www.fao.org/nutrition/education/food-dietary-guidelines/regions/countries/thailand/en/',
    published: 'Thai FBDG / Nutrition Flag',
    reviewed: SOURCE_REVIEW_DATE,
    used_for: [
      'Food-quality priorities in the meal plan',
      'Rice and starchy foods as the base, with varied vegetables and fruit',
      'Limiting added sugar, excess sodium and excess oil',
    ],
  },
  {
    id: 'issn_protein',
    title: 'International Society of Sports Nutrition Position Stand: protein and exercise',
    organisation: 'Journal of the International Society of Sports Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/',
    published: '2017',
    reviewed: SOURCE_REVIEW_DATE,
    used_for: [
      'Protein targets of 1.6-2.2 g per kg of bodyweight',
      'Spreading protein across eating occasions',
    ],
  },
];

export const EVIDENCE_LIMITS = [
  'This site is not a medical device and does not diagnose anything.',
  'Calorie and price figures are estimates. They are useful for spotting trends, not for precision.',
  'Exercise tutorial videos are not pre-verified. Where a video has not been checked, the site gives you an exact search phrase instead of a link it cannot vouch for.',
  'There is no weather service connected. Heat advice uses conditions you enter yourself.',
  'General guidance cannot account for an individual medical history. Where anything is uncertain, a qualified professional beats an app.',
];
