import { Level } from '@/lib/types';

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'TERMINAL BASICS',
    subtitle: 'Orientation & Core Navigation',
    description: 'Master the fundamental navigation commands: pwd, whoami, ls, cd, and clear.',
    minXpRequired: 0,
    color: '#7CFF6B', // Terminal Green
    iconName: 'Terminal',
  },
  {
    id: 2,
    name: 'FILE OPERATIONS',
    subtitle: 'Creation, Manipulation & Deletion',
    description: 'Learn to build directories, forge files, duplicate assets, and clean up workspace.',
    minXpRequired: 450,
    color: '#FFC857', // Amber
    iconName: 'FolderTree',
  },
  {
    id: 3,
    name: 'SEARCH & INSPECTION',
    subtitle: 'Pipes, Grep, Find & Text Filters',
    description: 'Investigate file systems, extract hidden tokens, inspect log streams, and count bytes.',
    minXpRequired: 1200,
    color: '#4EE2EC', // Cyan
    iconName: 'Search',
  },
  {
    id: 4,
    name: 'SHELL MASTERY & BOSS',
    subtitle: 'Processes, Networking & Grand Challenge',
    description: 'Monitor active processes, ping telemetry endpoints, and conquer the Rogue Daemon boss challenge.',
    minXpRequired: 2200,
    bossMissionId: 'mission-20',
    color: '#FF5C5C', // Red / Boss
    iconName: 'ShieldAlert',
  },
];
