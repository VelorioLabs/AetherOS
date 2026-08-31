/**
 * AetherOS Shell Builtin Commands
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

export class ShellCommands {
  constructor(vfs, scheduler, memory) {
    this.vfs = vfs;
    this.scheduler = scheduler;
    this.memory = memory;
    this.cwd = '/home/varshan';
  }

  execute(commandLine) {
    const trimmed = (commandLine || '').trim();
    if (!trimmed) return '';

    // Handle pipe commands (e.g. ps | grep)
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      let output = this.runSingle(parts[0]);
      for (let i = 1; i < parts.length; i++) {
        output = this.pipeFilter(output, parts[i]);
      }
      return output;
    }

    return this.runSingle(trimmed);
  }

  pipeFilter(input, filterCmd) {
    const [cmd, ...args] = filterCmd.split(/\s+/);
    if (cmd === 'grep') {
      const target = args[0] || '';
      return input.split('\n').filter(line => line.includes(target)).join('\n');
    }
    if (cmd === 'wc') {
      const lines = input.split('\n').filter(Boolean).length;
      return `${lines} lines`;
    }
    return input;
  }

  runSingle(line) {
    const [cmd, ...args] = line.split(/\s+/);

    switch (cmd.toLowerCase()) {
      case 'help':
        return `AetherOS Shell v1.0.0 (x86_64-web-kernel)
Available commands:
  neofetch       Display system telemetry & ASCII kernel banner
  ls [path]      List files in directory
  cat <file>     Display file content
  mkdir <dir>    Create directory in VFS
  rm <file/dir>  Remove file or directory
  touch <file>   Create empty file
  echo <text>    Print text (supports > redirection)
  cd [path]      Change working directory
  pwd            Print working directory
  ps             List active processes
  top            Show system performance monitor
  kill <pid>     Terminate process
  uname -a       Print kernel version
  matrix         Start cybernetic matrix rain
  omnigrab <url> Decompile media stream from URL
  cloudfuse      Inspect multi-cloud virtual RAID drive
  clear          Clear terminal screen`;

      case 'pwd':
        return this.cwd;

      case 'cd': {
        const target = args[0] || '/home/varshan';
        const norm = this.vfs.normalizePath(target, this.cwd);
        const node = this.vfs.resolveNode(norm);
        if (!node || node.type !== 'dir') return `cd: no such file or directory: ${target}`;
        this.cwd = norm;
        return '';
      }

      case 'ls': {
        const target = args[0] || this.cwd;
        try {
          const list = this.vfs.listDir(target, this.cwd);
          return list.map(item => `${item.type === 'dir' ? '📁 ' : '📄 '} ${item.name}`).join('  \n');
        } catch (e) {
          return e.message;
        }
      }

      case 'cat': {
        if (!args[0]) return 'cat: missing file operand';
        try {
          return this.vfs.readFile(args[0], this.cwd);
        } catch (e) {
          return e.message;
        }
      }

      case 'mkdir': {
        if (!args[0]) return 'mkdir: missing operand';
        try {
          this.vfs.mkdir(args[0], this.cwd);
          return '';
        } catch (e) {
          return e.message;
        }
      }

      case 'rm': {
        if (!args[0]) return 'rm: missing operand';
        try {
          this.vfs.remove(args[0], this.cwd);
          return '';
        } catch (e) {
          return e.message;
        }
      }

      case 'touch': {
        if (!args[0]) return 'touch: missing file operand';
        try {
          this.vfs.writeFile(args[0], '', this.cwd);
          return '';
        } catch (e) {
          return e.message;
        }
      }

      case 'echo': {
        const text = args.join(' ');
        if (text.includes('>')) {
          const [content, filename] = text.split('>').map(s => s.trim());
          this.vfs.writeFile(filename, content + '\n', this.cwd);
          return '';
        }
        return text;
      }

      case 'ps': {
        const procs = this.scheduler.getProcessList();
        let out = 'PID    USER       CPU%   MEM(MB)  STATE     NAME\n';
        out += '------------------------------------------------\n';
        procs.forEach(p => {
          out += `${String(p.pid).padEnd(6)} ${p.user.padEnd(10)} ${String(p.cpuPercent).padEnd(6)} ${String(p.memoryMb).padEnd(8)} ${p.state.padEnd(9)} ${p.name}\n`;
        });
        return out;
      }

      case 'top': {
        const mem = this.memory.getMetrics();
        const procs = this.scheduler.getProcessList();
        let out = `Tasks: ${procs.length} total, 1 running, ${procs.length - 1} sleeping\n`;
        out += `RAM: ${mem.totalMb}MB total, ${mem.allocatedMb}MB used (${mem.percentUsed}%), ${mem.freeMb}MB free\n\n`;
        out += 'PID    USER       CPU%   MEM(MB)  NAME\n';
        out += '--------------------------------------\n';
        procs.slice(0, 8).forEach(p => {
          out += `${String(p.pid).padEnd(6)} ${p.user.padEnd(10)} ${String(p.cpuPercent).padEnd(6)} ${String(p.memoryMb).padEnd(8)} ${p.name}\n`;
        });
        return out;
      }

      case 'kill': {
        const pid = args[0];
        if (!pid) return 'kill: usage: kill <pid>';
        try {
          this.scheduler.kill(pid);
          return `Process ${pid} terminated.`;
        } catch (e) {
          return e.message;
        }
      }

      case 'neofetch': {
        const mem = this.memory.getMetrics();
        return `
    .---.      varshan@velorio-node
   /     \\     --------------------
  | () () |    OS: AetherOS v1.0 (Web Micro-Kernel)
   \\  _  /     Host: WebAssembly JIT Hypervisor
    \`---\`      Kernel: 1.0.0-release-wasm
               Uptime: 4 hours, 18 mins
               Shell: aether-sh 1.0
               Compositor: WebGPU Glassmorphism
               Terminal: AetherTerm (xterm-256color)
               CPU: 8-Core Web Virtual Thread Engine
               Memory: ${mem.allocatedMb}MB / ${mem.totalMb}MB (${mem.percentUsed}%)
               Disk (VFS): 102.4 GB Multi-Cloud RAID Pool
        `;
      }

      case 'uname':
        return 'AetherOS 1.0.0-release #1 SMP WebAssembly x86_64 GNU/Linux';

      case 'whoami':
        return 'varshan';

      case 'date':
        return new Date().toUTCString();

      case 'uptime':
        return 'up 4 hours, 18 mins, load average: 0.12, 0.08, 0.04';

      case 'omnigrab':
        return `[OmniGrab Decompiler] Ready for input. Launching desktop graphical window...`;

      case 'cloudfuse':
        return `[CloudFuse Virtual Drive Z:\\] 102.4 GB Free across 4 Cloud-RAID nodes.`;

      default:
        return `aether-sh: command not found: ${cmd}. Type "help" for a list of kernel commands.`;
    }
  }
}
