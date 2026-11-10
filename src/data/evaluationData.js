/**
 * Official Evaluation Criteria and Form Data for NEMSU-FEAS
 * North Eastern Mindanao State University – Cantilan Campus
 * Student Evaluation of Teachers (SET)
 */

export const DEPARTMENTS = [];

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
