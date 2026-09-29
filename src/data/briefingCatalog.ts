export type Cadence = 'Daily' | 'Weekly' | 'Monthly'
export type Brief = { id: string; cadence: Cadence; title: string; blurb: string; length: string; tags: string[]; sample?: boolean }

export const CADENCES: { id: Cadence; sub: string }[] = [
  { id: 'Daily', sub: '3–5 min · every morning' },
  { id: 'Weekly', sub: '12–20 min · Fridays' },
  { id: 'Monthly', sub: '25–30 min · first Monday' },
]

/** Only the first entry has a real (synthetic-voice) recording. The rest illustrate the categories planned for each cadence. */
export const BRIEFS: Brief[] = [
  { id: 'd-all', cadence: 'Daily', title: 'Today’s conflict briefing', blurb: 'Top developments across Europe, the Middle East and Africa — the sample recording.', length: '1:43', tags: ['Global', 'Europe', 'Middle East', 'Africa', 'Ceasefire & talks'], sample: true },
  { id: 'd-eu', cadence: 'Daily', title: 'Ukraine & Europe', blurb: 'Frontline changes, strikes on civilian infrastructure, prisoner-of-war issues.', length: '≈ 4 min', tags: ['Europe', 'Detention', 'Civilian harm'] },
  { id: 'd-me', cadence: 'Daily', title: 'Middle East', blurb: 'Gaza, West Bank, Yemen, Iran and Lebanon — talks, strikes and humanitarian access.', length: '≈ 5 min', tags: ['Middle East', 'Ceasefire & talks', 'Humanitarian'] },
  { id: 'd-af', cadence: 'Daily', title: 'Africa', blurb: 'Sudan, Ethiopia, DR Congo, Somalia and the Sahel.', length: '≈ 4 min', tags: ['Africa', 'Displacement'] },
  { id: 'd-dp', cadence: 'Daily', title: 'Displacement watch', blurb: 'New flows, camps, border closures and returns.', length: '≈ 3 min', tags: ['Global', 'Displacement', 'Humanitarian'] },

  { id: 'w-rv', cadence: 'Weekly', title: 'Week in review', blurb: 'The five stories that mattered, region by region.', length: '≈ 15 min', tags: ['Global', 'Europe', 'Middle East', 'Africa', 'Asia'] },
  { id: 'w-ac', cadence: 'Weekly', title: 'Accountability digest', blurb: 'ICC, ICJ, fact-finding missions and domestic prosecutions.', length: '≈ 18 min', tags: ['Global', 'Accountability'] },
  { id: 'w-sa', cadence: 'Weekly', title: 'Sanctions & measures', blurb: 'New designations, lifted measures, licences and enforcement.', length: '≈ 12 min', tags: ['Global', 'Sanctions'] },
  { id: 'w-as', cadence: 'Weekly', title: 'Asylum & refugee law update', blurb: 'Non-refoulement rulings, status determinations, policy shifts.', length: '≈ 16 min', tags: ['Global', 'Displacement', 'Accountability'] },
  { id: 'w-dt', cadence: 'Weekly', title: 'Detention & hostages tracker', blurb: 'Arbitrary detention, prisoner exchanges and hostage negotiations.', length: '≈ 12 min', tags: ['Middle East', 'Europe', 'Detention'] },

  { id: 'm-rk', cadence: 'Monthly', title: 'Risk outlook', blurb: 'Countries moving between “Elevated risk” and “Active conflict”, and why.', length: '≈ 28 min', tags: ['Global', 'Europe', 'Middle East', 'Africa', 'Asia', 'Americas'] },
  { id: 'm-dp', cadence: 'Monthly', title: 'Displacement trends', blurb: 'Where people are moving, how many, and which routes are closing.', length: '≈ 25 min', tags: ['Africa', 'Asia', 'Displacement', 'Humanitarian'] },
  { id: 'm-lg', cadence: 'Monthly', title: 'Legal developments roundup', blurb: 'Judgments, mandates and treaty developments that shift case strategy.', length: '≈ 30 min', tags: ['Global', 'Accountability', 'Sanctions'] },
  { id: 'm-dd', cadence: 'Monthly', title: 'Regional deep dive', blurb: 'One region per month: history, actors, legal exposure.', length: '≈ 30 min', tags: ['Asia', 'Americas', 'Africa'] },
]

export const TAG_ORDER = ['Global', 'Europe', 'Middle East', 'Africa', 'Asia', 'Americas', 'Accountability', 'Displacement', 'Detention', 'Sanctions', 'Humanitarian', 'Ceasefire & talks', 'Civilian harm']
