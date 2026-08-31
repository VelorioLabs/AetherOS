/**
 * AetherTerm Terminal Emulator Native App
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

export function launchTerminalApp(windowManager, shellCommands) {
  windowManager.createWindow({
    id: 'terminal',
    title: 'AetherTerm — varshan@velorio-node',
    icon: 'fa-terminal',
    width: 720,
    height: 480,
    content: `
      <div class="h-full flex flex-col p-4 font-mono text-xs text-zinc-200 bg-[#040508]/95 overflow-hidden">
        <div id="termOutput" class="flex-1 overflow-y-auto space-y-1 pr-1 font-mono select-text">
          <div class="text-[#ccff00] font-bold">AetherOS Terminal v1.0.0 (x86_64-web-kernel)</div>
          <div class="text-zinc-400 text-[11px]">Type <span class="text-white font-bold">"help"</span> for built-in kernel commands or <span class="text-[#ccff00] font-bold">"neofetch"</span> for system telemetry.</div>
          <div class="h-2"></div>
        </div>
        
        <div class="flex items-center gap-2 pt-2 border-t border-white/10 flex-shrink-0">
          <span class="text-[#ccff00] font-bold">varshan@node:~$</span>
          <input type="text" id="termInput" autofocus class="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs caret-[#ccff00]" autocomplete="off" spellcheck="false">
        </div>
      </div>
    `,
    onInit: (container) => {
      const output = container.querySelector('#termOutput');
      const input = container.querySelector('#termInput');
      const history = [];
      let historyIdx = -1;

      function appendLine(html, isCmd = false) {
        const div = document.createElement('div');
        div.className = isCmd ? 'text-[#ccff00] font-bold mt-2' : 'text-zinc-300 leading-relaxed whitespace-pre-wrap';
        div.innerHTML = html;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = input.value.trim();
          if (cmd) {
            history.push(cmd);
            historyIdx = history.length;
            appendLine(`varshan@node:~$ ${cmd}`, true);

            if (cmd === 'clear') {
              output.innerHTML = '';
            } else if (cmd === 'matrix') {
              appendLine('<span class="text-emerald-400 font-bold">Initializing Cybernetic Matrix Rain...</span>');
            } else {
              const res = shellCommands.execute(cmd);
              if (res) appendLine(res);
            }
          }
          input.value = '';
        } else if (e.key === 'ArrowUp') {
          if (historyIdx > 0) {
            historyIdx--;
            input.value = history[historyIdx] || '';
          }
        } else if (e.key === 'ArrowDown') {
          if (historyIdx < history.length - 1) {
            historyIdx++;
            input.value = history[historyIdx] || '';
          } else {
            historyIdx = history.length;
            input.value = '';
          }
        }
      });

      // Auto-focus input when terminal window is clicked
      container.addEventListener('click', () => input.focus());
      input.focus();
    }
  });
}
