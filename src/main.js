/**
 * AetherOS Kernel Bootloader & Main Controller
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

import { VirtualFileSystem } from './kernel/vfs.js';
import { ProcessScheduler } from './kernel/scheduler.js';
import { VirtualMemory } from './kernel/memory.js';
import { ShellCommands } from './shell/commands.js';
import { WindowManager } from './compositor/windowManager.js';
import { launchTerminalApp } from './apps/terminalApp.js';
import { launchTaskManagerApp } from './apps/taskManagerApp.js';
import { launchOmniGrabApp } from './apps/omnigrabApp.js';

class AetherKernel {
  constructor() {
    this.vfs = new VirtualFileSystem();
    this.scheduler = new ProcessScheduler();
    this.memory = new VirtualMemory(8192);
    this.shell = new ShellCommands(this.vfs, this.scheduler, this.memory);
    this.windowManager = null;
  }

  boot() {
    console.log(`\n🌌 [AetherOS] Booting sovereign micro-kernel v1.0.0...`);
    console.log(`[✓] Virtual File System initialized with /bin, /home/varshan, /proc, /etc`);
    console.log(`[✓] Preemptive Process Scheduler started.`);
    console.log(`[✓] Virtual Memory paging initialized (8.0 GB virtual pool).`);

    const desktopEl = document.getElementById('desktopViewport');
    if (desktopEl) {
      this.windowManager = new WindowManager(desktopEl);
      this.initUI();
      
      // Auto-launch default welcome apps
      launchTerminalApp(this.windowManager, this.shell);
    }
  }

  initUI() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Dock App Clicks
    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.getAttribute('data-app');
        this.openApp(appId);
      });
    });

    // Spotlight Launcher (Ctrl+K or Cmd+K)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const spot = document.getElementById('spotlightModal');
        if (spot) {
          spot.classList.toggle('hidden');
          const input = spot.querySelector('input');
          if (!spot.classList.contains('hidden') && input) {
            input.focus();
          }
        }
      }
    });

    // Listen for window changes to update dock active dots
    window.addEventListener('aetheros:windowlist_changed', () => {
      document.querySelectorAll('.dock-item').forEach(btn => {
        const appId = btn.getAttribute('data-app');
        const dot = btn.querySelector('.dock-dot');
        if (dot) {
          if (this.windowManager && this.windowManager.windows.has(appId)) {
            dot.classList.remove('hidden');
          } else {
            dot.classList.add('hidden');
          }
        }
      });
    });
  }

  openApp(appId) {
    if (!this.windowManager) return;
    
    switch (appId) {
      case 'terminal':
        launchTerminalApp(this.windowManager, this.shell);
        break;
      case 'taskmanager':
        launchTaskManagerApp(this.windowManager, this.scheduler, this.memory);
        break;
      case 'omnigrab':
        launchOmniGrabApp(this.windowManager);
        break;
      case 'cloudfuse':
        this.windowManager.createWindow({
          id: 'cloudfuse',
          title: 'CloudFuse — Virtual Encrypted Drive (Z:\\)',
          icon: 'fa-shield-halved',
          width: 760,
          height: 480,
          content: `<iframe src="../cloudfuse/index.html" class="w-full h-full border-none"></iframe>`
        });
        break;
      case 'aetherstream':
        this.windowManager.createWindow({
          id: 'aetherstream',
          title: 'AetherStream — Hi-Res Music Engine',
          icon: 'fa-headphones',
          width: 760,
          height: 480,
          content: `<iframe src="../aetherstream/index.html" class="w-full h-full border-none"></iframe>`
        });
        break;
      default:
        launchTerminalApp(this.windowManager, this.shell);
    }
  }

  updateClock() {
    const clock = document.getElementById('topbarClock');
    if (clock) {
      const d = new Date();
      clock.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
}

const kernel = new AetherKernel();
document.addEventListener('DOMContentLoaded', () => kernel.boot());
export { kernel };
