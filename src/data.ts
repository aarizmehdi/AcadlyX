import { Course, Assignment, UserStats } from './types';

export const defaultCourses: Course[] = [];

export const defaultAssignments: Assignment[] = [];

export const defaultStats: UserStats = {
  totalHoursStudied: 0,
  assignmentsCompleted: 0,
  gpaGoal: 4.0,
  currentGpa: 0.0,
};
