/**
 * EDITABLE CONTENT
 *
 * This file holds all the editable data for the website:
 * - experiences: array of work and volunteer experience entries
 * - skillsPhotos: array of photo entries for the Skills section gallery
 *
 * To edit experiences:
 * 1. Modify the fields in the experiences array objects:
 *    - title: organization/role title
 *    - role: position name
 *    - loc: location
 *    - dates: date range (e.g., "Jun – Aug 2026")
 *    - bullets: array of achievement strings
 *    - photos: array of photo objects (see below)
 *
 * To add photos to an experience:
 * 1. Upload photo files to the images/ folder (suggested names: images/fpd-1.jpg, images/tedx-2.jpg, etc.)
 * 2. Add an object to the photos array with this structure:
 *    { src: 'images/your-photo.jpg', alt: 'Brief description', caption: 'Optional caption' }
 *
 * To add photos to the Skills section gallery:
 * 1. Add objects to the skillsPhotos array with the same structure as above
 */

const experiences = [
  {
    id: 'fpd',
    title: 'Federal Public Defender, W.D. Washington',
    role: 'Legal Intern',
    loc: 'Seattle, WA',
    dates: 'Jun – Aug 2026',
    bullets: [
      'Drafted motions including habeas petitions, motions to suppress, and early termination of supervised release (ETSR) motions.',
      'Wrote appellate briefs with direct guidance from the Chief Appellate Attorney.',
      'Worked on active defense trial teams for federal cases and conducted in-depth legal research.'
    ],
    photos: []
  },
  {
    id: 'tedx',
    title: 'TEDxBrownU',
    role: 'President',
    loc: 'Providence, RI',
    dates: 'Sep 2021 – May 2025',
    bullets: [
      'Hosted TEDx conferences where speakers have influenced over 1.2 million perspectives.',
      'Spearheaded speaker selection of hundreds of applicants, training them in public speaking and narrative crafting.',
      'Directed efforts across marketing, finance, technology, and stage design to earn the organization a high Net Promoter Score.'
    ],
    photos: []
  },
  {
    id: 'hcm',
    title: 'High Court of Malaysia',
    role: 'Attaché to Justice Ong Cheekwan',
    loc: 'Kuala Lumpur',
    dates: 'Jul – Aug 2024',
    bullets: [
      'Discussed the considerations behind judicial decisions for 125+ motions and trials with Justice Ong.',
      'Reviewed written submissions, fact bundles, and case exhibits to argue both legal positions pre-trial.',
      'Attended all chambers meetings and court mediation sessions directly with trial parties.'
    ],
    photos: []
  },
  {
    id: 'clo',
    title: 'Christopher & Lee Ong',
    role: 'Summer Associate',
    loc: 'Kuala Lumpur',
    dates: 'Jun – Jul 2024',
    bullets: [
      'Researched legal issues related to AI to inform case strategy, focusing on copyright and patent infringement.',
      'Drafted briefs for partners and clients on updates to global AI policy, including the EU AI Act.'
    ],
    photos: []
  },
  {
    id: 'rij',
    title: 'Rhode Island Center For Justice',
    role: 'Housing Advocate',
    loc: 'Providence, RI',
    dates: 'Sep 2023 – May 2024',
    bullets: [
      'Counseled Rhode Island residents facing acute housing crises and eviction proceedings.',
      'Utilized crisis de-escalation strategies during high-stress tenant-landlord disputes.'
    ],
    photos: []
  },
  {
    id: 'pierce',
    title: 'Pierce County Department of Public Defense',
    role: 'Investigative Assistant',
    loc: 'Tacoma, WA',
    dates: 'May – Aug 2023',
    bullets: [
      'Redacted and delivered critical case discovery to incarcerated clients while overseeing secure document review.',
      'Observed felony jury trials and discussed investigative strategy with county Investigations Specialists.'
    ],
    photos: []
  },
  {
    id: 'sun',
    title: 'Sunbird Trust',
    role: 'Teacher & Community Organizer',
    loc: 'Kachai, India',
    dates: 'Jun – Aug 2022',
    bullets: [
      'Taught public speaking, mathematics, and English at a low-income multi-tribal school with 250+ students (ages 5–16).',
      'Advanced community-building initiatives between neighboring tribal groups to promote regional stability and peace.'
    ],
    photos: []
  }
];

const skillsPhotos = [];
