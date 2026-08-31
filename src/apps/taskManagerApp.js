/**
 * Task Manager & Process Monitor Native App
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

export function launchTaskManagerApp(windowManager, scheduler, memory) {
  windowManager.createWindow({
    id: 'taskmanager',
    title: 'Process Monitor & Telemetry',
    icon: 'fa-chart-line',
    width: 640,
    height: 440,
    content: `
      <div class="h-full flex flex-col p-4 font-mono text-xs text-white space-y-4">
        <!-- Resource Telemetry Rings -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#0b0d12] border border-white/10 p-3.5 rounded-2xl">
            <div class="flex justify-between text-zinc-400 text-[10px] uppercase">
              <span>CPU Load</span>
              <span id="tmCpuVal" class="text-[#ccff00] font-bold">14.2%</span>
            </div>
            <div class="w-full h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div id="tmCpuBar" class="h-full bg-[#ccff00] rounded-full transition-all" style="width: 14%"></div>
            </div>
          </div>

          <div class="bg-[#0b0d12] border border-white/10 p-3.5 rounded-2xl">
            <div class="flex justify-between text-zinc-400 text-[10px] uppercase">
              <span>RAM Memory</span>
              <span id="tmMemVal" class="text-sky-400 font-bold">1.4 GB / 8.0 GB</span>
            </div>
            <div class="w-full h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div id="tmMemBar" class="h-full bg-sky-400 rounded-full transition-all" style="width: 18%"></div>
            </div>
          </div>
        </div>

        <!-- Processes List -->
        <div class="flex-1 bg-[#0b0d12] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div class="bg-white/5 px-4 py-2 border-b border-white/5 grid grid-cols-5 text-[10px] text-zinc-400 uppercase font-bold">
            <span>PID</span>
            <span class="col-span-2">Process Name</span>
            <span>CPU</span>
            <span class="text-right">Action</span>
          </div>
          <div id="tmProcList" class="flex-1 overflow-y-auto divide-y divide-white/5 font-mono text-xs">
            <!-- Injected by JS -->
          </div>
        </div>
      </div>
    `,
    onInit: (container) => {
      const cpuVal = container.querySelector('#tmCpuVal');
      const cpuBar = container.querySelector('#tmCpuBar');
      const memVal = container.querySelector('#tmMemVal');
      const memBar = container.querySelector('#tmMemBar');
      const procList = container.querySelector('#tmProcList');

      function updateMetrics() {
        const mem = memory.getMetrics();
        const procs = scheduler.getProcessList();
        
        const avgCpu = (procs.reduce((acc, p) => acc + p.cpuPercent, 0)).toFixed(1);
        cpuVal.textContent = `${avgCpu}%`;
        cpuBar.style.width = `${Math.min(100, avgCpu)}%`;

        memVal.textContent = `${(mem.allocatedMb / 1024).toFixed(1)} GB / ${(mem.totalMb / 1024).toFixed(1)} GB`;
        memBar.style.width = `${mem.percentUsed}%`;

        procList.innerHTML = '';
        procs.forEach(p => {
          const row = document.createElement('div');
          row.className = 'px-4 py-2 grid grid-cols-5 items-center hover:bg-white/[0.02] transition-colors';
          row.innerHTML = `
            <span class="text-zinc-500 font-bold">${p.pid}</span>
            <span class="col-span-2 text-white font-semibold truncate">${p.name}</span>
            <span class="text-[#ccff00]">${p.cpuPercent}%</span>
            <div class="text-right">
              ${p.pid > 1 ? `<button class="kill-btn bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-2 py-0.5 rounded text-[10px] transition-colors" data-pid="${p.pid}">Kill</button>` : '<span class="text-zinc-600 text-[10px]">Root</span>'}
            </div>
          `;

          const killBtn = row.querySelector('.kill-btn');
          if (killBtn) {
            killBtn.addEventListener('click', () => {
              scheduler.kill(p.pid);
              updateMetrics();
            });
          }

          procList.appendChild(row);
        });
      }

      updateMetrics();
      const timer = setInterval(updateMetrics, 2000);
      container.addEventListener('DOMNodeRemoved', () => clearInterval(timer));
    }
  });
}
