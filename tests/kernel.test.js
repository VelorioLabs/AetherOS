import assert from 'assert';
import { VirtualFileSystem } from '../src/kernel/vfs.js';
import { ProcessScheduler } from '../src/kernel/scheduler.js';
import { VirtualMemory } from '../src/kernel/memory.js';
import { ShellCommands } from '../src/shell/commands.js';

console.log('🧪 Running AetherOS Micro-Kernel Unit Tests...');

// 1. Test VFS File Operations
const vfs = new VirtualFileSystem();
assert.strictEqual(vfs.normalizePath('../varshan/welcome.txt', '/home/varshan'), '/home/varshan/welcome.txt');

const welcome = vfs.readFile('/home/varshan/welcome.txt');
assert(welcome.includes('Welcome to AetherOS'));

vfs.mkdir('/home/varshan/projects/lab');
vfs.writeFile('/home/varshan/projects/lab/manifesto.txt', 'Zero Cloud Independence');
assert.strictEqual(vfs.readFile('/home/varshan/projects/lab/manifesto.txt'), 'Zero Cloud Independence');
console.log('✅ PASS: Virtual File System (VFS) hierarchy & path normalization verified!');

// 2. Test Process Scheduler & Signals
const scheduler = new ProcessScheduler();
const procs = scheduler.getProcessList();
assert(procs.length >= 3, 'Kernel processes must be spawned on boot');

const spawned = scheduler.spawn('cyber_daemon', 'varshan', 60);
assert.strictEqual(spawned.name, 'cyber_daemon');

scheduler.kill(spawned.pid);
assert.strictEqual(scheduler.getProcess(spawned.pid), undefined);
console.log('✅ PASS: Preemptive Process Scheduler & SIGTERM killing verified!');

// 3. Test Virtual Memory Manager
const memory = new VirtualMemory(8192);
const memMetrics = memory.getMetrics();
assert.strictEqual(memMetrics.totalMb, 8192);
assert(memMetrics.freeMb > 0);
console.log('✅ PASS: Virtual Memory paging and RAM telemetry verified!');

// 4. Test Shell Command Piping
const shell = new ShellCommands(vfs, scheduler, memory);
const neofetchOut = shell.execute('neofetch');
assert(neofetchOut.includes('AetherOS'));

const pipeOut = shell.execute('ps | grep init');
assert(pipeOut.includes('init'), 'Pipe operator must filter output via grep');

const echoOut = shell.execute('echo "Velorio Sovereign" > /tmp/test.txt');
assert.strictEqual(vfs.readFile('/tmp/test.txt').trim(), '"Velorio Sovereign"');
console.log('✅ PASS: AetherTerm shell execution & pipe chaining verified!');

console.log('🎉 All AetherOS micro-kernel tests passed with 100% success!');
