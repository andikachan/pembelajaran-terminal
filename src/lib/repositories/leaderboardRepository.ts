import { redis } from '@/lib/redis';
import { LeaderboardEntry, PlayerProfile } from '@/lib/types';
import { getUserProfile } from './userRepository';

const LEADERBOARD_KEY = 'leaderboard:xp';

const MOCK_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, id: 'op_root', username: 'root_zero', callsign: 'ROOT//ARCHITECT', level: 18, xp: 9850, completedMissionsCount: 20, streak: 14, badge: 'GRANDMASTER' },
  { rank: 2, id: 'op_cypher', username: 'cypher_99', callsign: 'CYPHER_CORE', level: 16, xp: 8420, completedMissionsCount: 20, streak: 9, badge: 'ELITE' },
  { rank: 3, id: 'op_kernel', username: 'kernel_panic', callsign: 'VOID_KERNEL', level: 15, xp: 7600, completedMissionsCount: 19, streak: 7, badge: 'VETERAN' },
  { rank: 4, id: 'op_flux', username: 'flux_daemon', callsign: 'FLUX_DAEMON', level: 13, xp: 6250, completedMissionsCount: 18, streak: 5, badge: 'VETERAN' },
  { rank: 5, id: 'op_glitch', username: 'glitch_matrix', callsign: 'GLITCH_HUNTER', level: 11, xp: 5100, completedMissionsCount: 16, streak: 4, badge: 'OPERATOR' },
  { rank: 6, id: 'op_hex', username: 'hex_dumper', callsign: 'HEX_DUMP', level: 9, xp: 3950, completedMissionsCount: 14, streak: 3, badge: 'OPERATOR' },
  { rank: 7, id: 'op_bash', username: 'bash_kid', callsign: 'BASH_INITIATE', level: 7, xp: 2800, completedMissionsCount: 11, streak: 2, badge: 'SCOUT' },
  { rank: 8, id: 'op_nova', username: 'nova_sys', callsign: 'NOVA_CORE', level: 6, xp: 2150, completedMissionsCount: 9, streak: 2, badge: 'SCOUT' },
];

export async function updateLeaderboardScore(profile: PlayerProfile): Promise<void> {
  try {
    // Score is total XP
    await redis.zadd(LEADERBOARD_KEY, {
      score: profile.xp,
      member: profile.id,
    });
  } catch (error) {
    console.error('Error updating leaderboard score in Redis:', error);
  }
}

export async function getGlobalLeaderboard(limit = 20, currentPlayer?: PlayerProfile | null): Promise<LeaderboardEntry[]> {
  try {
    const rawIds = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, { rev: true });
    const liveEntries: LeaderboardEntry[] = [];

    if (Array.isArray(rawIds) && rawIds.length > 0) {
      for (const id of rawIds) {
        if (typeof id === 'string') {
          const profile = await getUserProfile(id);
          if (profile) {
            liveEntries.push({
              rank: 0,
              id: profile.id,
              username: profile.username,
              callsign: profile.callsign,
              level: profile.level,
              xp: profile.xp,
              completedMissionsCount: profile.completedMissions.length,
              streak: profile.streak,
              badge: profile.level >= 15 ? 'GRANDMASTER' : profile.level >= 10 ? 'ELITE' : profile.level >= 5 ? 'OPERATOR' : 'SCOUT',
            });
          }
        }
      }
    }

    // Combine live entries with mock entries if fewer than 5 exist
    const all = [...liveEntries];
    for (const mock of MOCK_LEADERBOARD_ENTRIES) {
      if (!all.some((e) => e.id === mock.id || (currentPlayer && e.id === currentPlayer.id))) {
        all.push(mock);
      }
    }

    // Ensure current player is included
    if (currentPlayer && !all.some((e) => e.id === currentPlayer.id)) {
      all.push({
        rank: 0,
        id: currentPlayer.id,
        username: currentPlayer.username,
        callsign: currentPlayer.callsign,
        level: currentPlayer.level,
        xp: currentPlayer.xp,
        completedMissionsCount: currentPlayer.completedMissions.length,
        streak: currentPlayer.streak,
        badge: currentPlayer.level >= 10 ? 'ELITE' : 'OPERATOR',
      });
    }

    // Sort by XP descending
    all.sort((a, b) => b.xp - a.xp);

    // Assign rank numbers
    return all.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    return MOCK_LEADERBOARD_ENTRIES.slice(0, limit);
  }
}
