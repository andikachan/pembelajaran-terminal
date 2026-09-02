import { VirtualFileSystem } from './VirtualFileSystem';

export interface CommandExecutionResult {
  output: string;
  exitCode: number;
  clearScreen?: boolean;
  command: string;
  rawInput: string;
  args: string[];
}

export function parseCommandLine(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const tokens: string[] = [];
  let currentToken = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if ((char === '"' || char === "'") && (!inQuotes || quoteChar === char)) {
      if (inQuotes) {
        inQuotes = false;
        quoteChar = '';
      } else {
        inQuotes = true;
        quoteChar = char;
      }
    } else if (/\s/.test(char) && !inQuotes) {
      if (currentToken.length > 0) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0) {
    tokens.push(currentToken);
  }

  return tokens;
}

export function executeVirtualCommand(
  rawInput: string,
  vfs: VirtualFileSystem
): CommandExecutionResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      output: '',
      exitCode: 0,
      command: '',
      rawInput,
      args: [],
    };
  }

  // Handle pipe operations (simple single pipe simulation like `cat file | grep pattern` or `cat file | sort`)
  if (trimmed.includes('|')) {
    const pipeParts = trimmed.split('|').map((s) => s.trim());
    if (pipeParts.length === 2) {
      const firstRes = executeVirtualCommand(pipeParts[0], vfs);
      if (firstRes.exitCode !== 0) return firstRes;

      const secondTokens = parseCommandLine(pipeParts[1]);
      const [secondCmd, ...secondArgs] = secondTokens;

      if (secondCmd === 'grep') {
        const pattern = secondArgs[0] || '';
        const lines = firstRes.output.split('\n').filter((l) => l.includes(pattern));
        return {
          output: lines.join('\n'),
          exitCode: lines.length > 0 ? 0 : 1,
          command: trimmed,
          rawInput,
          args: [],
        };
      } else if (secondCmd === 'sort') {
        const lines = firstRes.output.split('\n').filter(Boolean);
        lines.sort();
        return {
          output: lines.join('\n'),
          exitCode: 0,
          command: trimmed,
          rawInput,
          args: [],
        };
      } else if (secondCmd === 'head') {
        const count = parseInt(secondArgs[1] || secondArgs[0] || '10', 10);
        const lines = firstRes.output.split('\n').slice(0, isNaN(count) ? 10 : count);
        return {
          output: lines.join('\n'),
          exitCode: 0,
          command: trimmed,
          rawInput,
          args: [],
        };
      } else if (secondCmd === 'wc') {
        const lines = firstRes.output.split('\n').length;
        const words = firstRes.output.trim().split(/\s+/).length;
        return {
          output: ` ${lines} ${words} ${firstRes.output.length}`,
          exitCode: 0,
          command: trimmed,
          rawInput,
          args: [],
        };
      }
    }
  }

  // Handle redirection (`>` or `>>`)
  let commandStr = trimmed;
  let redirectFile: string | undefined;
  let isAppend = false;

  if (commandStr.includes('>>')) {
    const parts = commandStr.split('>>');
    commandStr = parts[0].trim();
    redirectFile = parts[1].trim();
    isAppend = true;
  } else if (commandStr.includes('>')) {
    const parts = commandStr.split('>');
    commandStr = parts[0].trim();
    redirectFile = parts[1].trim();
    isAppend = false;
  }

  const tokens = parseCommandLine(commandStr);
  if (tokens.length === 0) {
    return { output: '', exitCode: 0, command: '', rawInput, args: [] };
  }

  const [cmd, ...args] = tokens;

  // Check builtins & special commands
  if (cmd === 'clear') {
    return {
      output: '',
      exitCode: 0,
      clearScreen: true,
      command: cmd,
      rawInput,
      args,
    };
  }

  if (cmd === 'help') {
    const helpText = [
      'TERMINAL QUEST - SHELL REFERENCE v2.4.0',
      '────────────────────────────────────────',
      'Navigation:    pwd, cd [path], ls [-a] [-l]',
      'File Ops:      mkdir [-p] [dir], touch [file], cat [file], cp [src] [dst], mv [src] [dst], rm [-r] [path]',
      'Inspection:    grep [pattern] [file], find [path] [-name pattern], head [file], tail [file], wc [-l] [file], sort [file]',
      'System:        whoami, ps, kill [pid], ping [host], curl [url], chmod [mode] [path]',
      'Utilities:     echo [text] [> file], clear, help, reset',
      '────────────────────────────────────────',
      'Shortcuts:     Tab (autocomplete), Up/Down (history), Ctrl+L (clear screen)',
    ].join('\n');
    return { output: helpText, exitCode: 0, command: cmd, rawInput, args };
  }

  let result: { output: string; exitCode: number };

  switch (cmd) {
    case 'pwd':
      result = vfs.pwd();
      break;

    case 'whoami':
      result = vfs.whoami();
      break;

    case 'cd':
      result = vfs.cd(args[0]);
      break;

    case 'ls':
      result = vfs.ls(args);
      break;

    case 'mkdir': {
      const isRecursive = args.includes('-p');
      const targetDir = args.filter((a) => a !== '-p')[0];
      result = vfs.mkdir(targetDir, isRecursive);
      break;
    }

    case 'touch':
      result = vfs.touch(args[0]);
      break;

    case 'cat':
      result = vfs.cat(args);
      break;

    case 'echo': {
      const content = args.join(' ');
      result = vfs.echo(content, redirectFile, isAppend);
      // Redirection handled internally
      redirectFile = undefined;
      break;
    }

    case 'cp': {
      const isRecursive = args.includes('-r') || args.includes('-R');
      const nonFlagArgs = args.filter((a) => !a.startsWith('-'));
      result = vfs.cp(nonFlagArgs[0], nonFlagArgs[1], isRecursive);
      break;
    }

    case 'mv':
      result = vfs.mv(args[0], args[1]);
      break;

    case 'rm': {
      const isRecursive = args.some((a) => a.includes('r') || a.includes('R'));
      const isForce = args.some((a) => a.includes('f'));
      const target = args.filter((a) => !a.startsWith('-'))[0];
      result = vfs.rm(target, isRecursive, isForce);
      break;
    }

    case 'grep': {
      let caseInsensitive = false;
      let pattern = '';
      let targetFile = '';

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-i') {
          caseInsensitive = true;
        } else if (!pattern) {
          pattern = args[i];
        } else if (!targetFile) {
          targetFile = args[i];
        }
      }
      result = vfs.grep(pattern, targetFile, caseInsensitive);
      break;
    }

    case 'find': {
      let searchDir = '.';
      let namePattern: string | undefined;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-name' && args[i + 1]) {
          namePattern = args[i + 1];
          i++;
        } else if (!args[i].startsWith('-')) {
          searchDir = args[i];
        }
      }
      result = vfs.find(searchDir, namePattern);
      break;
    }

    case 'head': {
      let count = 10;
      let filePath = '';
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) {
          count = parseInt(args[i + 1], 10) || 10;
          i++;
        } else if (args[i].startsWith('-') && /^\-\d+$/.test(args[i])) {
          count = parseInt(args[i].substring(1), 10) || 10;
        } else {
          filePath = args[i];
        }
      }
      result = vfs.head(filePath, count);
      break;
    }

    case 'tail': {
      let count = 10;
      let filePath = '';
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) {
          count = parseInt(args[i + 1], 10) || 10;
          i++;
        } else if (args[i].startsWith('-') && /^\-\d+$/.test(args[i])) {
          count = parseInt(args[i].substring(1), 10) || 10;
        } else {
          filePath = args[i];
        }
      }
      result = vfs.tail(filePath, count);
      break;
    }

    case 'wc': {
      const linesOnly = args.includes('-l');
      const target = args.filter((a) => !a.startsWith('-'))[0];
      result = vfs.wc(target, linesOnly);
      break;
    }

    case 'sort':
      result = vfs.sort(args[0]);
      break;

    case 'chmod':
      result = vfs.chmod(args[0], args[1]);
      break;

    case 'chown':
      result = vfs.chown(args[0], args[1]);
      break;

    case 'ps':
      result = vfs.ps();
      break;

    case 'kill':
      result = vfs.kill(args[0]);
      break;

    case 'ping':
      result = vfs.ping(args.filter((a) => !a.startsWith('-'))[0]);
      break;

    case 'curl':
      result = vfs.curl(args.filter((a) => !a.startsWith('-'))[0]);
      break;

    case 'date':
      result = { output: new Date().toUTCString(), exitCode: 0 };
      break;

    case 'uname':
      result = { output: 'Linux terminal-quest 6.5.0-generic #42-Ubuntu SMP x86_64 GNU/Linux', exitCode: 0 };
      break;

    case 'uptime':
      result = { output: ' 01:39:20 up 42 days,  3:14,  1 user,  load average: 0.08, 0.03, 0.01', exitCode: 0 };
      break;

    case 'su': {
      const targetUser = args[0] === '-' ? (args[1] || 'root') : (args[0] || 'root');
      vfs.switchUser(targetUser);
      result = {
        output: targetUser === 'root'
          ? 'Switched to superuser (root). Prompt switched to #.'
          : `Switched to user ${targetUser}.`,
        exitCode: 0,
      };
      break;
    }

    case 'sudo': {
      if (args.length === 0) {
        result = { output: 'usage: sudo <command> or sudo su', exitCode: 1 };
      } else if (args[0] === 'su' || args[0] === '-i' || args[0] === 'bash') {
        vfs.switchUser('root');
        result = {
          output: '[sudo] authenticated. Switched to superuser (root). Prompt switched to #.',
          exitCode: 0,
        };
      } else {
        // Execute command as root temporarily
        const originalUser = vfs.getUser();
        vfs.setUser('root');
        const subCommand = args.join(' ');
        const subResult = executeVirtualCommand(subCommand, vfs);
        vfs.setUser(originalUser);
        return subResult;
      }
      break;
    }

    case 'exit': {
      const exitRes = vfs.exitUser();
      if (exitRes.success) {
        result = {
          output: `exit\nlogout: Returned to user ${exitRes.previousUser}. Prompt switched to $.`,
          exitCode: 0,
        };
      } else {
        result = {
          output: 'exit: session cannot be terminated. You are at the base login shell.',
          exitCode: 0,
        };
      }
      break;
    }

    case 'hostname': {
      if (args.length > 0) {
        vfs.setHostname(args[0]);
        result = { output: `System hostname set to ${vfs.getHostname()}`, exitCode: 0 };
      } else {
        result = { output: vfs.getHostname(), exitCode: 0 };
      }
      break;
    }

    case 'id': {
      const u = vfs.getUser();
      if (u === 'root') {
        result = { output: 'uid=0(root) gid=0(root) groups=0(root)', exitCode: 0 };
      } else {
        result = { output: `uid=1000(${u}) gid=1000(${u}) groups=1000(${u}),4(adm),24(cdrom),27(sudo),30(dip)`, exitCode: 0 };
      }
      break;
    }

    case 'reset':
      vfs.reset();
      result = { output: 'Filesystem state reset to factory defaults.', exitCode: 0 };
      break;

    default:
      result = {
        output: `${cmd}: command not found\nType 'help' to inspect available training commands.`,
        exitCode: 127,
      };
      break;
  }

  // If redirectFile was specified and not handled by echo
  if (redirectFile && result.exitCode === 0) {
    vfs.echo(result.output, redirectFile, isAppend);
    return {
      output: '',
      exitCode: 0,
      command: cmd,
      rawInput,
      args,
    };
  }

  return {
    output: result.output,
    exitCode: result.exitCode,
    command: cmd,
    rawInput,
    args,
  };
}
