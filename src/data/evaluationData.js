/**
 * Official Evaluation Criteria and Form Data for NEMSU-FEAS
 * North Eastern Mindanao State University – Cantilan Campus
 * Student Evaluation of Teachers (SET)
 */

export const DEPARTMENTS = [
  { id: 2, code: 'DBM', name: 'Business and Management', fullName: 'Department of Business and Management' },
  { id: 1, code: 'DCS', name: 'Computer Studies', fullName: 'Department of Computer Studies' },
  { id: 3, code: 'DIT', name: 'Industrial Technology', fullName: 'Department of Industrial Technology' },
  { id: 4, code: 'DGTT', name: 'General Teacher Education', fullName: 'Department of General Teacher Education' },
  { id: 5, code: 'CCJE', name: 'Criminal Justice Education', fullName: 'College of Criminal Justice Education' },
];

export const FALLBACK_FACULTY_BY_DEPT = {
  DCS: [
    { id: 1, name: 'Engr. Maria Santos', courses: 'CS 101, IT 211' },
    { id: 2, name: 'Prof. Alexander Cruz', courses: 'IT 211, CS 301' },
    { id: 3, name: 'Dr. Jane Doe', courses: 'CS 301, IT 312' },
    { id: 4, name: 'Prof. Juan dela Cruz', courses: 'CS 101, IT 312' },
  ],
  DBM: [
    { id: 5, name: 'Dr. Arthur Pendelton', courses: 'BA 101, ACC 201' },
    { id: 6, name: 'Prof. Karen Miller', courses: 'BA 101, ACC 201' },
  ],
  DIT: [
    { id: 7, name: 'Engr. Roberto Alcantara', courses: 'ITEC 110, ET 202' },
    { id: 8, name: 'Prof. Mark Johnson', courses: 'ITEC 110, ET 202' },
  ],
  DGTT: [
    { id: 9, name: 'Dr. Lourdes Mendoza', courses: 'ED 101, ED 205' },
    { id: 10, name: 'Prof. Cherry Garcia', courses: 'ED 101, ED 205' },
  ],
  CCJE: [
    { id: 11, name: 'Atty. Ronald B. Dela Cruz', courses: 'CRIM 101, LEA 201' },
    { id: 12, name: 'Prof. Dennis Torres', courses: 'CRIM 101, LEA 201' },
  ],
};

export function formatDepartmentName(name = '') {
  return name
    .replace(/^Department of\s+/i, '')
    .replace(/^College of\s+/i, '')
    .trim();
}

export const RATING_SCALE = [
  {
    score: 5,
    label: 'Always manifested',
    description: 'Evident in nearly all relevant situations (91-100% of instances).',
    color: '#24845A',
    bgColor: '#EDF7F2',
    borderColor: '#BFE7D4',
  },
  {
    score: 4,
    label: 'Often manifested',
    description: 'Evident most of the time, with occasional lapses (61-90%).',
    color: '#13469E',
    bgColor: '#EDF2FA',
    borderColor: '#C7D7F0',
  },
  {
    score: 3,
    label: 'Sometimes manifested',
    description: 'Evident about half of the time (31-60%).',
    color: '#D99B2B',
    bgColor: '#FEF8EB',
    borderColor: '#FBE0A6',
  },
  {
    score: 2,
    label: 'Seldom manifested',
    description: 'Infrequently demonstrated: rarely evident in relevant situations (11-30%).',
    color: '#E07722',
    bgColor: '#FFF3EB',
    borderColor: '#FCD2B5',
  },
  {
    score: 1,
    label: 'Never/Rarely manifested',
    description: 'Seldom demonstrated: almost never evident, with only isolated cases (0-10%).',
    color: '#C65353',
    bgColor: '#FDF2F2',
    borderColor: '#F8BDBD',
  },
];

export const EVALUATION_SECTIONS = [
  {
    id: 'sectionA',
    code: 'A',
    title: 'A. Management of Teaching and Learning',
    description: 'Rate each statement from 5 (always manifested) to 1 (never/rarely manifested).',
    items: [
      {
        id: 'a1',
        text: 'Comes to class on time.',
      },
      {
        id: 'a2',
        text: 'Explains learning outcomes, expectations, grading system, and various requirements of the subject/course.',
      },
      {
        id: 'a3',
        text: 'Maximizes the allocated time/learning hours effectively.',
      },
      {
        id: 'a4',
        text: 'Facilitates students to think critically and creatively by providing appropriate learning activities.',
      },
      {
        id: 'a5',
        text: 'Guides students to learn on their own, reflect on new ideas and experiences, and make decisions in accomplishing given tasks.',
      },
      {
        id: 'a6',
        text: 'Communicates constructive feedback to students for their academic growth.',
      },
    ],
  },
  {
    id: 'sectionB',
    code: 'B',
    title: 'B. Content, Knowledge, Pedagogy and Technology',
    description: 'Rate each statement from 5 (always manifested) to 1 (never/rarely manifested).',
    items: [
      {
        id: 'b1',
        text: 'Demonstrates extensive and broad knowledge of the subject/course.',
      },
      {
        id: 'b2',
        text: 'Simplifies complex ideas in the lesson for ease of understanding.',
      },
      {
        id: 'b3',
        text: 'Relates the subject matter to contemporary issues and developments in the discipline and/or daily life activities.',
      },
      {
        id: 'b4',
        text: 'Promotes active learning and student engagement by using appropriate teaching and learning resources including ICT tools and platforms.',
      },
      {
        id: 'b5',
        text: 'Uses appropriate assessments (projects, exams, quizzes, assignments, etc.) aligned with the learning outcomes.',
      },
    ],
  },
  {
    id: 'sectionC',
    code: 'C',
    title: 'C. Commitment and Transparency',
    description: 'Rate each statement from 5 (always manifested) to 1 (never/rarely manifested).',
    items: [
      {
        id: 'c1',
        text: 'Recognizes and values the unique diversity and individual differences among students.',
      },
      {
        id: 'c2',
        text: 'Assists students with their learning challenges during consultation hours.',
      },
      {
        id: 'c3',
        text: 'Provides immediate feedback on students outputs and performance.',
      },
      {
        id: 'c4',
        text: 'Provides transparent and clear criteria in rating student’s performance.',
      },
    ],
  },
];

export const STEP_TITLES = [
  'Email & Data Privacy',
  'Faculty & Course',
  'Rating Scale Orientation',
  'Section A: Management of Teaching',
  'Section B: Content & Pedagogy',
  'Section C: Commitment & Transparency',
  'Constructive Feedback',
];
