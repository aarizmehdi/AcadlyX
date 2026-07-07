import { Course, Assignment, UserStats } from './types';

export const defaultCourses: Course[] = [
  {
    id: 'course-1',
    name: 'Advanced Algorithms',
    code: 'CS301',
    color: '#6366f1', // Indigo
    credits: 4,
  },
  {
    id: 'course-2',
    name: 'Operating Systems',
    code: 'CS302',
    color: '#10b981', // Emerald
    credits: 4,
  },
  {
    id: 'course-3',
    name: 'Linear Algebra',
    code: 'MATH240',
    color: '#a855f7', // Purple
    credits: 3,
  },
  {
    id: 'course-4',
    name: 'Human-Computer Interaction',
    code: 'CS355',
    color: '#ec4899', // Pink
    credits: 3,
  },
];

export const defaultAssignments: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Red-Black Tree Quiz prep',
    description: 'Verify properties of black-height balance and rotate algorithms under insertion and deletion cases.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    courseId: 'course-1',
    isCompleted: false,
    difficulty: 'medium',
    progress: 66,
    brokenDownSteps: [
      { id: 'step-1-1', title: 'Re-read Chapter 13 of CLRS textbook', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: true },
      { id: 'step-1-2', title: 'Practice 5 tree rotation trace examples', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: true },
      { id: 'step-1-3', title: 'Take online practice quizzes', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: false },
    ],
  },
  {
    id: 'assign-2',
    title: 'Implement Virtual Memory Sim',
    description: 'Design and write a complete virtual address space translator in C++ implementing multi-level page tables and LRU paging.',
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from now
    courseId: 'course-2',
    isCompleted: false,
    difficulty: 'hard',
    progress: 25,
    brokenDownSteps: [
      { id: 'step-2-1', title: 'Outline physical frame struct & page tables', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: true },
      { id: 'step-2-2', title: 'Implement FIFO page replacement algorithm', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: false },
      { id: 'step-2-3', title: 'Implement LRU and aging register schemes', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: false },
      { id: 'step-2-4', title: 'Stress test translator against multi-threaded inputs', dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: false },
    ],
  },
  {
    id: 'assign-3',
    title: 'Matrix Transformations Worksheet',
    description: 'Determine eigenvalues and verify eigenspaces for three-dimensional rotation matrices.',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    courseId: 'course-3',
    isCompleted: true,
    difficulty: 'easy',
    progress: 100,
    brokenDownSteps: [
      { id: 'step-3-1', title: 'Solve standard characteristic equations', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: true },
      { id: 'step-3-2', title: 'Validate orthonormal vectors using cross products', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isCompleted: true },
    ],
  },
  {
    id: 'assign-4',
    title: 'Interactive Design Figma Spec',
    description: 'Create high-fidelity wireframes for our student helper dashboard, emphasizing accessibility margins.',
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days from now
    courseId: 'course-4',
    isCompleted: false,
    difficulty: 'medium',
    progress: 0,
    brokenDownSteps: [],
  },
];

export const defaultStats: UserStats = {
  totalHoursStudied: 48,
  assignmentsCompleted: 24,
  gpaGoal: 4.0,
  currentGpa: 3.82,
};
