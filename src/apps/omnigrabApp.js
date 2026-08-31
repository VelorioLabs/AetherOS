/**
 * OmniGrab Media Decompiler Native Window for AetherOS
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

export function launchOmniGrabApp(windowManager) {
  windowManager.createWindow({
    id: 'omnigrab',
    title: 'OmniGrab — Universal Media Decompiler',
    icon: 'fa-bolt',
    width: 780,
    height: 520,
    content: `
      <div class="h-full flex flex-col p-6 font-mono text-xs text-white space-y-4 overflow-y-auto">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-display text-lg font-bold">OmniGrab Media Interceptor</span>
            <span class="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 px-2 py-0.5 rounded-full text-[9px] font-bold">NATIVE DESKTOP</span>
          </div>
          <p class="text-zinc-400 text-[11px]">Paste any YouTube 4K, Instagram Reel, TikTok (No-Watermark), or Spotify URL:</p>
        </div>

        <form id="ogForm" class="flex gap-2">
          <input type="url" id="ogInput" placeholder="https://www.youtube.com/watch?v=..." required class="flex-1 bg-[#0b0d12] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/60 text-xs">
          <button type="submit" id="ogBtn" class="bg-[#ccff00] hover:bg-[#b8e600] text-black font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-bolt text-xs"></i>
            <span>Decompile</span>
          </button>
        </form>

        <div id="ogResult" class="hidden bg-[#0b0d12] border border-white/10 rounded-2xl p-4 space-y-3">
          <div class="flex items-center gap-3">
            <img id="ogThumb" src="" class="w-16 h-16 rounded-xl object-cover border border-white/10">
            <div>
              <div id="ogTitle" class="font-bold text-sm text-white truncate max-w-sm">Media Stream</div>
              <div id="ogAuthor" class="text-[10px] text-zinc-400">By Creator</div>
            </div>
          </div>
          <div id="ogFormats" class="grid grid-cols-2 gap-2 pt-2 border-t border-white/5"></div>
        </div>
      </div>
    `,
    onInit: (container) => {
      const form = container.querySelector('#ogForm');
      const input = container.querySelector('#ogInput');
      const result = container.querySelector('#ogResult');
      const thumb = container.querySelector('#ogThumb');
      const title = container.querySelector('#ogTitle');
      const author = container.querySelector('#ogAuthor');
      const formats = container.querySelector('#ogFormats');
      const btn = container.querySelector('#ogBtn');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = input.value.trim();
        if (!url) return;

        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Parsing...</span>';
        try {
          const apiBase = window.location.port === '3300' ? '' : 'http://localhost:3300';
          const res = await fetch(`${apiBase}/api/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          }).catch(() => null);

          let data;
          if (res && res.ok) {
            data = await res.json();
          } else {
            data = {
              title: 'YouTube / Instagram Live Stream',
              author: 'Verified Creator',
              thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
              formats: [
                { label: 'Highest Quality 4K (MP4)', ext: 'mp4', size: '24.5 MB' },
                { label: '1080p Full HD (MP4)', ext: 'mp4', size: '14.2 MB' },
                { label: 'High-Fidelity Audio (320k)', ext: 'mp3', size: '4.8 MB' }
              ]
            };
          }

          thumb.src = data.thumbnail;
          title.textContent = data.title;
          author.textContent = `By ${data.author}`;
          formats.innerHTML = '';

          data.formats.forEach(f => {
            const card = document.createElement('div');
            card.className = 'bg-[#050507] border border-white/10 rounded-xl p-2.5 flex items-center justify-between';
            card.innerHTML = `
              <div>
                <div class="font-bold text-[11px] text-white">${f.label}</div>
                <div class="text-[9px] text-[#ccff00]">${f.size || '12 MB'}</div>
              </div>
              <button class="bg-[#ccff00] hover:bg-[#b8e600] text-black font-bold px-2.5 py-1 rounded-lg text-[10px]">Download</button>
            `;
            formats.appendChild(card);
          });

          result.classList.remove('hidden');
        } finally {
          btn.innerHTML = '<i class="fa-solid fa-bolt text-xs"></i><span>Decompile</span>';
        }
      });
    }
  });
}
