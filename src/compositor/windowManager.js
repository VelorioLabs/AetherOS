/**
 * AetherOS Window Compositor & Multi-Tasking Window Manager
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

export class WindowManager {
  constructor(desktopContainer) {
    this.container = desktopContainer;
    this.windows = new Map();
    this.activeWindow = null;
    this.topZIndex = 100;
  }

  createWindow({ id, title, icon = 'fa-window-maximize', width = 680, height = 480, content = '', onInit = null }) {
    if (this.windows.has(id)) {
      const existing = this.windows.get(id);
      this.restoreWindow(id);
      this.focusWindow(id);
      return existing;
    }

    const winEl = document.createElement('div');
    winEl.id = `win-${id}`;
    winEl.className = 'absolute rounded-2xl bg-[#080a0f]/90 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden select-none transition-shadow';
    winEl.style.width = `${width}px`;
    winEl.style.height = `${height}px`;
    
    // Staggered positioning
    const offset = (this.windows.size * 28) % 180;
    winEl.style.left = `${Math.max(40, (window.innerWidth - width) / 2 + offset)}px`;
    winEl.style.top = `${Math.max(60, (window.innerHeight - height) / 2 + offset)}px`;
    winEl.style.zIndex = ++this.topZIndex;

    winEl.innerHTML = `
      <!-- Window Titlebar -->
      <div class="window-titlebar h-10 bg-white/[0.03] border-b border-white/5 px-4 flex items-center justify-between cursor-move flex-shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="flex items-center gap-1.5">
            <button class="win-btn-close w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"></button>
            <button class="win-btn-minimize w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors"></button>
            <button class="win-btn-maximize w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors"></button>
          </div>
          <div class="h-3.5 w-px bg-white/10 mx-1"></div>
          <div class="flex items-center gap-2 text-xs font-mono font-bold text-white">
            <i class="fa-solid ${icon} text-[#ccff00] text-xs"></i>
            <span class="truncate max-w-[220px] sm:max-w-xs">${title}</span>
          </div>
        </div>
      </div>

      <!-- Window Content -->
      <div class="window-content flex-1 overflow-auto relative bg-[#050507]/60">
        ${content}
      </div>
    `;

    this.container.appendChild(winEl);
    this.setupWindowInteractions(winEl, id);

    const winObj = { id, title, icon, element: winEl, isMinimized: false, isMaximized: false };
    this.windows.set(id, winObj);
    this.focusWindow(id);

    if (onInit) {
      onInit(winEl.querySelector('.window-content'));
    }

    // Trigger dock update
    window.dispatchEvent(new CustomEvent('aetheros:windowlist_changed'));

    return winObj;
  }

  setupWindowInteractions(winEl, id) {
    const titlebar = winEl.querySelector('.window-titlebar');
    const closeBtn = winEl.querySelector('.win-btn-close');
    const minBtn = winEl.querySelector('.win-btn-minimize');
    const maxBtn = winEl.querySelector('.win-btn-maximize');

    // Focus on click
    winEl.addEventListener('mousedown', () => this.focusWindow(id));

    // Close
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    });

    // Minimize
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    });

    // Maximize
    maxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(id);
    });

    // Draggable
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = winEl.offsetLeft;
      initialTop = winEl.offsetTop;
      this.focusWindow(id);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      winEl.style.left = `${Math.max(0, initialLeft + dx)}px`;
      winEl.style.top = `${Math.max(36, initialTop + dy)}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  focusWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.element.style.zIndex = ++this.topZIndex;
    this.activeWindow = id;
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.element.style.display = 'none';
    win.isMinimized = true;
    window.dispatchEvent(new CustomEvent('aetheros:windowlist_changed'));
  }

  restoreWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.element.style.display = 'flex';
    win.isMinimized = false;
    this.focusWindow(id);
    window.dispatchEvent(new CustomEvent('aetheros:windowlist_changed'));
  }

  toggleMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;
    const el = win.element;

    if (!win.isMaximized) {
      win.prevStyle = {
        left: el.style.left,
        top: el.style.top,
        width: el.style.width,
        height: el.style.height
      };
      el.style.left = '0px';
      el.style.top = '36px';
      el.style.width = '100vw';
      el.style.height = 'calc(100vh - 36px - 72px)';
      el.classList.add('rounded-none');
      win.isMaximized = true;
    } else {
      el.style.left = win.prevStyle.left;
      el.style.top = win.prevStyle.top;
      el.style.width = win.prevStyle.width;
      el.style.height = win.prevStyle.height;
      el.classList.remove('rounded-none');
      win.isMaximized = false;
    }
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.element.remove();
    this.windows.delete(id);
    window.dispatchEvent(new CustomEvent('aetheros:windowlist_changed'));
  }
}
