import { NodeType, VFSNode, VFSSnapshot } from '@/lib/types';
import { DEFAULT_VFS_ROOT } from '@/data/defaultFilesystem';

export class VirtualFileSystem {
  private root: VFSNode;
  private currentPath: string; // Absolute path, e.g. "/home/player"
  private user: string = 'player';
  private hostname: string = 'terminal-quest';
  private userStack: string[] = [];
  private processes: Array<{ pid: number; tty: string; time: string; cmd: string }> = [
    { pid: 1, tty: '?', time: '00:00:03', cmd: 'systemd' },
    { pid: 142, tty: '?', time: '00:00:01', cmd: 'cron' },
    { pid: 382, tty: 'pts/0', time: '00:00:00', cmd: 'bash' },
    { pid: 490, tty: 'pts/0', time: '00:00:00', cmd: 'ps' },
  ];

  constructor(initialRoot?: VFSNode, initialPath: string = '/home/player') {
    this.root = initialRoot ? JSON.parse(JSON.stringify(initialRoot)) : JSON.parse(JSON.stringify(DEFAULT_VFS_ROOT));
    this.currentPath = initialPath;
  }

  public getCwd(): string {
    return this.currentPath;
  }

  public getUser(): string {
    return this.user;
  }

  public setUser(u: string) {
    this.user = u;
  }

  public getHostname(): string {
    return this.hostname;
  }

  public setHostname(h: string) {
    this.hostname = h.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'terminal-quest';
  }

  public switchUser(targetUser: string) {
    this.userStack.push(this.user);
    this.user = targetUser || 'root';
  }

  public exitUser(): { success: boolean; previousUser?: string } {
    if (this.userStack.length > 0) {
      const prev = this.userStack.pop()!;
      this.user = prev;
      return { success: true, previousUser: prev };
    }
    return { success: false };
  }

  public getPromptDetails(): {
    user: string;
    hostname: string;
    displayPath: string;
    symbol: string;
    isRoot: boolean;
  } {
    const isRoot = this.user === 'root';
    let displayPath = this.currentPath;

    if (this.user === 'player' && displayPath.startsWith('/home/player')) {
      displayPath = displayPath.replace('/home/player', '~');
    } else if (isRoot && displayPath === '/root') {
      displayPath = '~';
    }

    return {
      user: this.user,
      hostname: this.hostname,
      displayPath,
      symbol: isRoot ? '#' : '$',
      isRoot,
    };
  }

  public getSnapshot(): VFSSnapshot {
    return {
      root: JSON.parse(JSON.stringify(this.root)),
      currentPath: this.currentPath,
      history: [],
    };
  }

  public reset(customRoot?: VFSNode, customPath = '/home/player') {
    this.root = customRoot ? JSON.parse(JSON.stringify(customRoot)) : JSON.parse(JSON.stringify(DEFAULT_VFS_ROOT));
    this.currentPath = customPath;
  }

  // Normalize path string relative to currentPath or absolute root
  public resolvePath(targetPath: string): string {
    if (!targetPath || targetPath === '.') {
      return this.currentPath;
    }

    if (targetPath.startsWith('~')) {
      targetPath = targetPath.replace('~', '/home/' + this.user);
    }

    const isAbsolute = targetPath.startsWith('/');
    const parts = targetPath.split('/').filter(Boolean);
    const resolvedParts: string[] = isAbsolute ? [] : this.currentPath.split('/').filter(Boolean);

    for (const part of parts) {
      if (part === '.') {
        continue;
      } else if (part === '..') {
        if (resolvedParts.length > 0) {
          resolvedParts.pop();
        }
      } else {
        resolvedParts.push(part);
      }
    }

    return '/' + resolvedParts.join('/');
  }

  public getNode(path: string): VFSNode | null {
    const absPath = this.resolvePath(path);
    if (absPath === '/' || absPath === '') {
      return this.root;
    }

    const parts = absPath.split('/').filter(Boolean);
    let current: VFSNode = this.root;

    for (const part of parts) {
      if (!current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }

    return current;
  }

  public exists(path: string): boolean {
    return this.getNode(path) !== null;
  }

  public isDir(path: string): boolean {
    const node = this.getNode(path);
    return node !== null && node.type === 'directory';
  }

  public readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') return null;
    return node.content ?? '';
  }

  public listDir(path: string = '.'): string[] | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory' || !node.children) return null;
    return Object.keys(node.children);
  }

  // === Core Shell Commands ===

  public pwd(): { output: string; exitCode: number } {
    return { output: this.currentPath, exitCode: 0 };
  }

  public whoami(): { output: string; exitCode: number } {
    return { output: this.user, exitCode: 0 };
  }

  public cd(targetPath: string = '~'): { output: string; exitCode: number } {
    if (!targetPath || targetPath === '~') {
      targetPath = `/home/${this.user}`;
    }

    const resolved = this.resolvePath(targetPath);
    const node = this.getNode(resolved);

    if (!node) {
      return { output: `cd: ${targetPath}: No such file or directory`, exitCode: 1 };
    }

    if (node.type !== 'directory') {
      return { output: `cd: ${targetPath}: Not a directory`, exitCode: 1 };
    }

    this.currentPath = resolved;
    return { output: '', exitCode: 0 };
  }

  public ls(args: string[] = []): { output: string; exitCode: number } {
    let showAll = false;
    let longFormat = false;
    let targetPath = '.';

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) longFormat = true;
      } else {
        targetPath = arg;
      }
    }

    const node = this.getNode(targetPath);
    if (!node) {
      return { output: `ls: cannot access '${targetPath}': No such file or directory`, exitCode: 2 };
    }

    if (node.type === 'file') {
      return { output: node.name, exitCode: 0 };
    }

    if (!node.children) {
      return { output: '', exitCode: 0 };
    }

    let items = Object.values(node.children);
    if (!showAll) {
      items = items.filter((item) => !item.name.startsWith('.'));
    }

    items.sort((a, b) => a.name.localeCompare(b.name));

    if (longFormat) {
      const lines: string[] = [`total ${items.length * 4}`];
      if (showAll) {
        lines.push(`drwxr-xr-x 2 ${this.user} ${this.user} 4096 Sep 01 00:00 .`);
        lines.push(`drwxr-xr-x 4 ${this.user} ${this.user} 4096 Sep 01 00:00 ..`);
      }
      for (const item of items) {
        const prefix = item.type === 'directory' ? 'd' : '-';
        const perms = item.permissions.startsWith('-') || item.permissions.startsWith('d')
          ? item.permissions
          : `${prefix}${item.permissions}`;
        const padSize = String(item.size).padStart(6, ' ');
        const dateStr = 'Sep 01 00:00';
        lines.push(`${perms} 1 ${item.owner} ${item.group} ${padSize} ${dateStr} ${item.name}`);
      }
      return { output: lines.join('\n'), exitCode: 0 };
    }

    if (items.length === 0) {
      return { output: '', exitCode: 0 };
    }

    return { output: items.map((i) => i.name).join('  '), exitCode: 0 };
  }

  public mkdir(path: string, recursive: boolean = false): { output: string; exitCode: number } {
    if (!path) {
      return { output: 'mkdir: missing operand', exitCode: 1 };
    }

    const absPath = this.resolvePath(path);
    if (this.getNode(absPath)) {
      return { output: `mkdir: cannot create directory '${path}': File exists`, exitCode: 1 };
    }

    const parts = absPath.split('/').filter(Boolean);
    const dirName = parts.pop()!;
    const parentPath = '/' + parts.join('/');

    let parentNode = this.getNode(parentPath);
    if (!parentNode) {
      if (recursive) {
        // Create ancestors
        let current = this.root;
        for (const part of parts) {
          if (!current.children) current.children = {};
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              type: 'directory',
              permissions: 'rwxr-xr-x',
              owner: this.user,
              group: this.user,
              size: 4096,
              updatedAt: new Date().toISOString(),
              children: {},
            };
          }
          current = current.children[part];
        }
        parentNode = current;
      } else {
        return { output: `mkdir: cannot create directory '${path}': No such file or directory`, exitCode: 1 };
      }
    }

    if (parentNode.type !== 'directory') {
      return { output: `mkdir: cannot create directory '${path}': Not a directory`, exitCode: 1 };
    }

    if (!parentNode.children) {
      parentNode.children = {};
    }

    parentNode.children[dirName] = {
      name: dirName,
      type: 'directory',
      permissions: 'rwxr-xr-x',
      owner: this.user,
      group: this.user,
      size: 4096,
      updatedAt: new Date().toISOString(),
      children: {},
    };

    return { output: '', exitCode: 0 };
  }

  public touch(path: string): { output: string; exitCode: number } {
    if (!path) {
      return { output: 'touch: missing file operand', exitCode: 1 };
    }

    const absPath = this.resolvePath(path);
    const existing = this.getNode(absPath);
    if (existing) {
      existing.updatedAt = new Date().toISOString();
      return { output: '', exitCode: 0 };
    }

    const parts = absPath.split('/').filter(Boolean);
    const fileName = parts.pop()!;
    const parentPath = '/' + parts.join('/');
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'directory') {
      return { output: `touch: cannot touch '${path}': No such file or directory`, exitCode: 1 };
    }

    if (!parentNode.children) {
      parentNode.children = {};
    }

    parentNode.children[fileName] = {
      name: fileName,
      type: 'file',
      content: '',
      permissions: 'rw-r--r--',
      owner: this.user,
      group: this.user,
      size: 0,
      updatedAt: new Date().toISOString(),
    };

    return { output: '', exitCode: 0 };
  }

  public cat(files: string[]): { output: string; exitCode: number } {
    if (files.length === 0) {
      return { output: '', exitCode: 0 };
    }

    const outputs: string[] = [];
    for (const file of files) {
      const node = this.getNode(file);
      if (!node) {
        return { output: `cat: ${file}: No such file or directory`, exitCode: 1 };
      }
      if (node.type === 'directory') {
        return { output: `cat: ${file}: Is a directory`, exitCode: 1 };
      }
      outputs.push(node.content ?? '');
    }

    return { output: outputs.join('\n'), exitCode: 0 };
  }

  public echo(content: string, redirectFile?: string, append: boolean = false): { output: string; exitCode: number } {
    if (!redirectFile) {
      return { output: content, exitCode: 0 };
    }

    const absPath = this.resolvePath(redirectFile);
    const existing = this.getNode(absPath);

    if (existing) {
      if (existing.type === 'directory') {
        return { output: `bash: ${redirectFile}: Is a directory`, exitCode: 1 };
      }
      existing.content = append ? (existing.content || '') + '\n' + content : content;
      existing.size = existing.content.length;
      existing.updatedAt = new Date().toISOString();
      return { output: '', exitCode: 0 };
    }

    // Create file
    const parts = absPath.split('/').filter(Boolean);
    const fileName = parts.pop()!;
    const parentPath = '/' + parts.join('/');
    const parent = this.getNode(parentPath);

    if (!parent || parent.type !== 'directory') {
      return { output: `bash: ${redirectFile}: No such file or directory`, exitCode: 1 };
    }

    if (!parent.children) parent.children = {};
    parent.children[fileName] = {
      name: fileName,
      type: 'file',
      content: content,
      permissions: 'rw-r--r--',
      owner: this.user,
      group: this.user,
      size: content.length,
      updatedAt: new Date().toISOString(),
    };

    return { output: '', exitCode: 0 };
  }

  public cp(src: string, dest: string, recursive: boolean = false): { output: string; exitCode: number } {
    if (!src || !dest) {
      return { output: 'cp: missing file operand', exitCode: 1 };
    }

    const srcNode = this.getNode(src);
    if (!srcNode) {
      return { output: `cp: cannot stat '${src}': No such file or directory`, exitCode: 1 };
    }

    if (srcNode.type === 'directory' && !recursive) {
      return { output: `cp: -r not specified; omitting directory '${src}'`, exitCode: 1 };
    }

    const destAbs = this.resolvePath(dest);
    const destNode = this.getNode(destAbs);

    let targetParent: VFSNode | null = null;
    let targetName: string = '';

    if (destNode && destNode.type === 'directory') {
      targetParent = destNode;
      targetName = srcNode.name;
    } else {
      const parts = destAbs.split('/').filter(Boolean);
      targetName = parts.pop()!;
      targetParent = this.getNode('/' + parts.join('/'));
    }

    if (!targetParent || targetParent.type !== 'directory') {
      return { output: `cp: cannot create regular file '${dest}': No such file or directory`, exitCode: 1 };
    }

    if (!targetParent.children) targetParent.children = {};
    targetParent.children[targetName] = JSON.parse(JSON.stringify(srcNode));
    targetParent.children[targetName].name = targetName;

    return { output: '', exitCode: 0 };
  }

  public mv(src: string, dest: string): { output: string; exitCode: number } {
    if (!src || !dest) {
      return { output: 'mv: missing file operand', exitCode: 1 };
    }

    const cpRes = this.cp(src, dest, true);
    if (cpRes.exitCode !== 0) {
      return cpRes;
    }

    this.rm(src, true, true);
    return { output: '', exitCode: 0 };
  }

  public rm(path: string, recursive: boolean = false, force: boolean = false): { output: string; exitCode: number } {
    if (!path) {
      return { output: 'rm: missing operand', exitCode: 1 };
    }

    const absPath = this.resolvePath(path);
    if (absPath === '/') {
      return { output: 'rm: it is dangerous to operate recursively on \'/\'', exitCode: 1 };
    }

    const targetNode = this.getNode(absPath);
    if (!targetNode) {
      if (force) return { output: '', exitCode: 0 };
      return { output: `rm: cannot remove '${path}': No such file or directory`, exitCode: 1 };
    }

    if (targetNode.type === 'directory' && !recursive) {
      return { output: `rm: cannot remove '${path}': Is a directory`, exitCode: 1 };
    }

    const parts = absPath.split('/').filter(Boolean);
    const itemName = parts.pop()!;
    const parentPath = '/' + parts.join('/');
    const parentNode = this.getNode(parentPath);

    if (parentNode && parentNode.children && parentNode.children[itemName]) {
      delete parentNode.children[itemName];
    }

    return { output: '', exitCode: 0 };
  }

  public grep(pattern: string, filePath?: string, caseInsensitive: boolean = false): { output: string; exitCode: number } {
    if (!pattern) {
      return { output: 'grep: search pattern required', exitCode: 1 };
    }

    if (!filePath) {
      return { output: 'grep: missing target file', exitCode: 1 };
    }

    const node = this.getNode(filePath);
    if (!node) {
      return { output: `grep: ${filePath}: No such file or directory`, exitCode: 2 };
    }

    if (node.type === 'directory') {
      return { output: `grep: ${filePath}: Is a directory`, exitCode: 2 };
    }

    const content = node.content ?? '';
    const lines = content.split('\n');
    const matched: string[] = [];

    const flags = caseInsensitive ? 'i' : '';
    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
    } catch {
      regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    }

    for (const line of lines) {
      if (regex.test(line)) {
        matched.push(line);
      }
    }

    return { output: matched.join('\n'), exitCode: matched.length > 0 ? 0 : 1 };
  }

  public find(startPath: string = '.', namePattern?: string): { output: string; exitCode: number } {
    const absStart = this.resolvePath(startPath);
    const startNode = this.getNode(absStart);

    if (!startNode) {
      return { output: `find: ‘${startPath}’: No such file or directory`, exitCode: 1 };
    }

    const results: string[] = [];

    const traverse = (node: VFSNode, relPath: string) => {
      let matches = true;
      if (namePattern) {
        const regexStr = '^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
        const regex = new RegExp(regexStr);
        matches = regex.test(node.name);
      }

      if (matches && relPath) {
        results.push(relPath);
      }

      if (node.type === 'directory' && node.children) {
        for (const childName of Object.keys(node.children).sort()) {
          const childNode = node.children[childName];
          const nextRel = relPath === '.' ? `./${childName}` : `${relPath}/${childName}`;
          traverse(childNode, nextRel);
        }
      }
    };

    traverse(startNode, startPath === '.' ? '.' : startPath);
    return { output: results.join('\n'), exitCode: 0 };
  }

  public head(path: string, count: number = 10): { output: string; exitCode: number } {
    const node = this.getNode(path);
    if (!node) return { output: `head: cannot open '${path}' for reading: No such file or directory`, exitCode: 1 };
    if (node.type === 'directory') return { output: `head: error reading '${path}': Is a directory`, exitCode: 1 };

    const lines = (node.content ?? '').split('\n');
    return { output: lines.slice(0, count).join('\n'), exitCode: 0 };
  }

  public tail(path: string, count: number = 10): { output: string; exitCode: number } {
    const node = this.getNode(path);
    if (!node) return { output: `tail: cannot open '${path}' for reading: No such file or directory`, exitCode: 1 };
    if (node.type === 'directory') return { output: `tail: error reading '${path}': Is a directory`, exitCode: 1 };

    const lines = (node.content ?? '').split('\n');
    return { output: lines.slice(-count).join('\n'), exitCode: 0 };
  }

  public wc(path: string, linesOnly: boolean = false): { output: string; exitCode: number } {
    const node = this.getNode(path);
    if (!node) return { output: `wc: ${path}: No such file or directory`, exitCode: 1 };
    if (node.type === 'directory') return { output: `wc: ${path}: Is a directory\n0 0 0 ${path}`, exitCode: 0 };

    const content = node.content ?? '';
    const lines = content.length > 0 ? content.split('\n').length : 0;
    const words = content.trim().length > 0 ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;

    if (linesOnly) {
      return { output: `${lines} ${path}`, exitCode: 0 };
    }

    return { output: ` ${lines}  ${words} ${chars} ${path}`, exitCode: 0 };
  }

  public sort(path: string): { output: string; exitCode: number } {
    const node = this.getNode(path);
    if (!node) return { output: `sort: cannot read: ${path}: No such file or directory`, exitCode: 2 };
    if (node.type === 'directory') return { output: `sort: read failed: ${path}: Is a directory`, exitCode: 2 };

    const lines = (node.content ?? '').split('\n').filter(Boolean);
    lines.sort((a, b) => a.localeCompare(b));
    return { output: lines.join('\n'), exitCode: 0 };
  }

  public chmod(mode: string, path: string): { output: string; exitCode: number } {
    const node = this.getNode(path);
    if (!node) return { output: `chmod: cannot access '${path}': No such file or directory`, exitCode: 1 };

    // Standard simulated chmod
    if (mode === '755' || mode === '+x') {
      node.permissions = 'rwxr-xr-x';
      node.isExecutable = true;
    } else if (mode === '644') {
      node.permissions = 'rw-r--r--';
    } else if (mode === '777') {
      node.permissions = 'rwxrwxrwx';
    } else if (mode === '600' || mode === '400') {
      node.permissions = 'rw-------';
    } else {
      node.permissions = 'rwxr-xr-x';
    }

    return { output: '', exitCode: 0 };
  }

  public chown(owner: string, path: string): { output: string; exitCode: number } {
    const node = this.getNode(path);
    if (!node) return { output: `chown: cannot access '${path}': No such file or directory`, exitCode: 1 };
    node.owner = owner;
    return { output: '', exitCode: 0 };
  }

  public ps(): { output: string; exitCode: number } {
    const header = '  PID TTY          TIME CMD';
    const lines = this.processes.map((p) => `${String(p.pid).padStart(5, ' ')} ${p.tty.padEnd(8, ' ')} ${p.time} ${p.cmd}`);
    return { output: [header, ...lines].join('\n'), exitCode: 0 };
  }

  public kill(pid: string): { output: string; exitCode: number } {
    const pNum = parseInt(pid, 10);
    if (isNaN(pNum)) return { output: `bash: kill: ${pid}: arguments must be process or job IDs`, exitCode: 1 };

    const idx = this.processes.findIndex((p) => p.pid === pNum);
    if (idx === -1) {
      return { output: `bash: kill: (${pid}) - No such process`, exitCode: 1 };
    }

    this.processes.splice(idx, 1);
    return { output: '', exitCode: 0 };
  }

  public ping(host: string): { output: string; exitCode: number } {
    if (!host) return { output: 'ping: usage: ping [-c count] destination', exitCode: 1 };
    const cleanHost = host.replace(/https?:\/\//, '');
    const out = [
      `PING ${cleanHost} (127.0.0.1) 56(84) bytes of data.`,
      `64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.034 ms`,
      `64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.041 ms`,
      `64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=0.038 ms`,
      `--- ${cleanHost} ping statistics ---`,
      `3 packets transmitted, 3 received, 0% packet loss, time 2004ms`,
      `rtt min/avg/max/mdev = 0.034/0.037/0.041/0.003 ms`,
    ].join('\n');
    return { output: out, exitCode: 0 };
  }

  public curl(url: string): { output: string; exitCode: number } {
    if (!url) return { output: 'curl: try \'curl --help\' for more information', exitCode: 2 };
    return {
      output: `HTTP/1.1 200 OK\nDate: ${new Date().toUTCString()}\nContent-Type: application/json\n\n{"status":"active","gateway":"terminal-quest-station","authorized":true}`,
      exitCode: 0,
    };
  }
}
