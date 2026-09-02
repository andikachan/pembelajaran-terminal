// Type definitions for Terminal Quest

export type NodeType = 'file' | 'directory';

export interface VFSNode {
  name: string;
  type: NodeType;
  content?: string; // For files
  children?: { [name: string]: VFSNode }; // For directories
  permissions: string; // e.g. "rwxr-xr-x" or "rw-r--r--"
  owner: string; // e.g. "player" or "root"
  group: string; // e.g. "player" or "root"
  size: number; // in bytes
  updatedAt: string; // ISO date or simulated timestamp
  isExecutable?: boolean;
}

export interface VFSSnapshot {
  root: VFSNode;
  currentPath: string; // e.g. "/home/player"
  history: string[];
}

export interface TerminalOutputLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'success' | 'system' | 'ascii';
  text: string;
  path?: string;
  user?: string;
  hostname?: string;
  symbol?: string;
  isRoot?: boolean;
  timestamp?: number;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  category: string;
  level: number;
  question: string;
  scenario?: string;
  commandSnippet?: string;
  options: QuizOption[];
  explanation: string;
  xpReward: number;
}

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'boss';

export interface MissionHint {
  id: number;
  text: string;
  xpPenalty: number; // Amount subtracted from base XP (e.g. 30 for hint 1, 60 for hint 2)
}

export interface MissionValidatorContext {
  command: string;
  rawArgs: string[];
  output: string;
  exitCode: number;
  vfs: {
    cwd: string;
    nodeExists: (path: string) => boolean;
    readFile: (path: string) => string | null;
    isDir: (path: string) => boolean;
    listDir: (path: string) => string[] | null;
  };
}

export interface Mission {
  id: string;
  levelId: number;
  order: number;
  title: string;
  scenario: string;
  objective: string;
  tip?: string;
  expectedCommands: string[]; // Reference / accepted commands or patterns
  allowedCommands?: string[]; // Optional whitelist filter
  xp: number;
  difficulty: MissionDifficulty;
  hints: MissionHint[];
  isBoss?: boolean;
  initialPath?: string; // e.g. "/home/player"
  customInitialFs?: Record<string, any>; // Injected initial files for this specific mission
  // Custom validation rule function name or rule config
  validationRule: string;
  validationParams?: Record<string, any>;
  completionMessage?: string;
}

export interface Level {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  minXpRequired: number;
  bossMissionId?: string;
  color: string;
  iconName: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'mastery' | 'secret' | 'speed';
  xpReward: number;
  unlockedAt?: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  callsign: string;
  level: number;
  xp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedMissions: string[]; // Mission IDs
  unlockedAchievements: string[]; // Achievement IDs
  commandCount: number;
  accuracyRate: number; // 0 to 100 percentage
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  callsign: string;
  level: number;
  xp: number;
  completedMissionsCount: number;
  streak: number;
  badge?: string;
}

export interface MissionValidationResult {
  success: boolean;
  message: string;
  xpEarned?: number;
  unlockedNextMissionId?: string;
  unlockedAchievements?: Achievement[];
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0.0 - 1.0
}
