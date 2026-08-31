/**
 * Preemptive Process Scheduler for AetherOS Micro-Kernel
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

export class ProcessScheduler {
  constructor() {
    this.processes = new Map();
    this.nextPid = 1;
    this.initKernelProcesses();
  }

  initKernelProcesses() {
    this.spawn('init', 'kernel', 100);
    this.spawn('kcompositor', 'system', 90);
    this.spawn('vfsd', 'system', 85);
  }

  spawn(name, user = 'varshan', priority = 50, memoryMb = 12.5) {
    const pid = this.nextPid++;
    const proc = {
      pid,
      name,
      user,
      state: 'RUNNING',
      priority,
      cpuPercent: Number((Math.random() * 2.5 + 0.2).toFixed(1)),
      memoryMb: Number(memoryMb.toFixed(1)),
      startedAt: new Date().toISOString(),
      ticks: 0
    };
    this.processes.set(pid, proc);
    return proc;
  }

  kill(pid, signal = 'SIGTERM') {
    const numPid = Number(pid);
    if (!this.processes.has(numPid)) {
      throw new Error(`kill: (${numPid}) - No such process`);
    }

    if (numPid === 1) {
      throw new Error('kill: (1) - Cannot terminate init process');
    }

    const proc = this.processes.get(numPid);
    proc.state = 'TERMINATED';
    this.processes.delete(numPid);
    return true;
  }

  getProcessList() {
    return Array.from(this.processes.values()).map(p => ({
      ...p,
      ticks: p.ticks + 1,
      cpuPercent: p.pid === 1 ? 0.1 : Number((Math.random() * 3.5 + 0.1).toFixed(1))
    }));
  }

  getProcess(pid) {
    return this.processes.get(Number(pid));
  }
}
