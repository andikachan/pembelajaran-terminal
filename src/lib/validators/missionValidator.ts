import { Mission, MissionValidationResult, VFSNode } from '@/lib/types';
import { VirtualFileSystem } from '../vfs/VirtualFileSystem';
import { CommandExecutionResult } from '../vfs/commandInterpreter';

export function validateMissionCommand(
  mission: Mission,
  commandResult: CommandExecutionResult,
  vfs: VirtualFileSystem,
  hintsUsedCount: number = 0
): MissionValidationResult {
  const { command, args, rawInput, output, exitCode } = commandResult;
  const normalizedRaw = rawInput.trim().replace(/\s+/g, ' ');

  // Calculate XP after hint deductions
  let xp = mission.xp;
  if (hintsUsedCount > 0) {
    const penaltyTotal = mission.hints
      .slice(0, hintsUsedCount)
      .reduce((sum, h) => sum + h.xpPenalty, 0);
    xp = Math.max(25, xp - penaltyTotal);
  }

  const successResult = (customMsg?: string): MissionValidationResult => ({
    success: true,
    message: customMsg || mission.completionMessage || 'COMMAND ACCEPTED. Mission complete!',
    xpEarned: xp,
  });

  const failResult = (reason?: string): MissionValidationResult => ({
    success: false,
    message: reason || 'Objective not met yet. Check the requirements and try again.',
  });

  // Check if command failed with exit code > 0 (unless mission is specifically about handling errors)
  if (exitCode !== 0 && mission.validationRule !== 'check_error_case') {
    return failResult();
  }

  switch (mission.validationRule) {
    case 'check_pwd':
      if (command === 'pwd' && output.includes('/home/player')) {
        return successResult();
      }
      break;

    case 'check_whoami':
      if (command === 'whoami' && output.trim() === 'player') {
        return successResult();
      }
      break;

    case 'check_ls':
      if (command === 'ls') {
        return successResult();
      }
      break;

    case 'check_cd_documents':
      if (vfs.getCwd().endsWith('/Documents')) {
        return successResult();
      }
      break;

    case 'check_clear':
      if (command === 'clear' || commandResult.clearScreen) {
        return successResult();
      }
      break;

    case 'check_mkdir_sandbox':
      if (
        (command === 'mkdir' && args.some((a) => a.includes('sandbox'))) ||
        vfs.exists('/home/player/sandbox') ||
        vfs.exists('sandbox')
      ) {
        return successResult();
      }
      break;

    case 'check_touch_beacon':
      if (
        (command === 'touch' && args.some((a) => a.includes('beacon.txt'))) ||
        vfs.exists('/home/player/beacon.txt') ||
        vfs.exists('beacon.txt') ||
        vfs.exists('/home/player/Documents/beacon.txt')
      ) {
        return successResult();
      }
      break;

    case 'check_cat_brief':
      if (
        command === 'cat' &&
        (args.some((a) => a.includes('mission_brief.txt')) || output.includes('TERMINAL ACADEMY DOSSIER'))
      ) {
        return successResult();
      }
      break;

    case 'check_cp_notes':
      if (
        vfs.exists('backup_notes.txt') ||
        vfs.exists('notes_backup.txt') ||
        vfs.exists('/home/player/backup_notes.txt') ||
        vfs.exists('/home/player/notes_backup.txt') ||
        vfs.exists('/home/player/Documents/backup_notes.txt') ||
        vfs.exists('/home/player/Documents/notes_backup.txt')
      ) {
        return successResult();
      }
      break;

    case 'check_mv_secrets':
      if (
        vfs.exists('/home/player/Documents/secrets.txt') ||
        (command === 'mv' && args.some((a) => a.includes('secrets.txt')) && args.some((a) => a.includes('Documents')))
      ) {
        return successResult();
      }
      break;

    case 'check_rm_archive':
      if (!vfs.exists('/home/player/Downloads/archive.tar.gz')) {
        return successResult();
      }
      break;

    case 'check_find_txt':
      if (command === 'find' && (args.includes('-name') || rawInput.includes('.txt') || output.includes('.txt'))) {
        return successResult();
      }
      break;

    case 'check_grep_confidential':
      if (
        command === 'grep' &&
        (rawInput.toLowerCase().includes('confidential') || output.includes('CONFIDENTIAL') || output.includes('TQ_CORE_DELTA_990'))
      ) {
        return successResult();
      }
      break;

    case 'check_wc_lines':
      if (command === 'wc' && (args.includes('-l') || rawInput.includes('-l'))) {
        return successResult();
      }
      break;

    case 'check_head_brief':
      if (command === 'head' && (rawInput.includes('-n 2') || rawInput.includes('-2') || output.includes('TERMINAL ACADEMY DOSSIER'))) {
        return successResult();
      }
      break;

    case 'check_ls_hidden':
      if (command === 'ls' && (args.some((a) => a.includes('a')) || rawInput.includes('-a'))) {
        return successResult();
      }
      break;

    case 'check_ps':
      if (command === 'ps' && output.includes('PID')) {
        return successResult();
      }
      break;

    case 'check_ping':
      if (command === 'ping' && (output.includes('0% packet loss') || output.includes('bytes from 127.0.0.1'))) {
        return successResult();
      }
      break;

    case 'check_kill_142':
      if (command === 'kill' && (args.includes('142') || rawInput.includes('142'))) {
        return successResult();
      }
      break;

    case 'check_boss_daemon':
      if (
        (command === 'kill' && (args.includes('142') || rawInput.includes('142'))) ||
        (command === 'cat' && rawInput.includes('rogue_daemon.conf'))
      ) {
        return successResult('BOSS DEFEATED! Rogue process neutralized and master clearance confirmed.');
      }
      break;

    default:
      // Fallback expected command match
      if (mission.expectedCommands.some((exp) => normalizedRaw.toLowerCase() === exp.toLowerCase())) {
        return successResult();
      }
      break;
  }

  return failResult();
}
