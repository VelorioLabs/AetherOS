/**
 * Unix-like Virtual File System (VFS) for AetherOS Micro-Kernel
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

export class VirtualFileSystem {
  constructor() {
    this.root = {
      type: 'dir',
      children: {
        bin: { type: 'dir', children: {} },
        etc: { type: 'dir', children: {
          'os-release': { type: 'file', content: 'NAME="AetherOS"\nVERSION="1.0.0 Sovereign"\nID=aetheros\nPRETTY_NAME="AetherOS 1.0 (Velorio Labs)"\n' },
          'hostname': { type: 'file', content: 'velorio-quantum-node\n' }
        }},
        home: { type: 'dir', children: {
          varshan: { type: 'dir', children: {
            'welcome.txt': { type: 'file', content: 'Welcome to AetherOS by Velorio Labs!\nA sovereign micro-kernel desktop environment running directly in your browser.\n\nType "help" in AetherTerm to see available kernel commands.\n' },
            'notes.md': { type: 'file', content: '# Velorio Labs Manifesto\n1. Zero Cloud Dependency\n2. Deterministic Performance\n3. Sovereign Cryptography\n' },
            'downloads': { type: 'dir', children: {} }
          }}
        }},
        proc: { type: 'dir', children: {
          'version': { type: 'file', content: 'AetherOS Kernel v1.0.0-release (x86_64-web-wasm) #1 SMP VelorioLabs 2026\n' },
          'cpuinfo': { type: 'file', content: 'processor: 8\nmodel name: WebAssembly High-Performance JIT Core\nfeatures: WebGPU, SIMD128, Threads, Atomic\n' },
          'meminfo': { type: 'file', content: 'MemTotal: 8388608 kB\nMemFree: 6291456 kB\nMemAvailable: 7340032 kB\n' }
        }},
        dev: { type: 'dir', children: {
          'null': { type: 'dev', content: '' },
          'random': { type: 'dev', content: 'random_generator' }
        }},
        tmp: { type: 'dir', children: {} }
      }
    };
  }

  normalizePath(pathStr, cwd = '/home/varshan') {
    if (!pathStr.startsWith('/')) {
      pathStr = `${cwd}/${pathStr}`;
    }
    const segments = pathStr.split('/').filter(Boolean);
    const resolved = [];
    for (const seg of segments) {
      if (seg === '.') continue;
      if (seg === '..') resolved.pop();
      else resolved.push(seg);
    }
    return '/' + resolved.join('/');
  }

  resolveNode(pathStr, cwd = '/home/varshan') {
    const norm = this.normalizePath(pathStr, cwd);
    if (norm === '/') return this.root;

    const segments = norm.split('/').filter(Boolean);
    let curr = this.root;

    for (const seg of segments) {
      if (!curr || curr.type !== 'dir' || !curr.children[seg]) {
        return null;
      }
      curr = curr.children[seg];
    }
    return curr;
  }

  readFile(pathStr, cwd = '/home/varshan') {
    const node = this.resolveNode(pathStr, cwd);
    if (!node) throw new Error(`vfs: ${pathStr}: No such file or directory`);
    if (node.type === 'dir') throw new Error(`vfs: ${pathStr}: Is a directory`);
    return node.content || '';
  }

  writeFile(pathStr, content, cwd = '/home/varshan') {
    const norm = this.normalizePath(pathStr, cwd);
    const segments = norm.split('/').filter(Boolean);
    const filename = segments.pop();
    const parentPath = '/' + segments.join('/');

    let parent = this.resolveNode(parentPath);
    if (!parent) {
      this.mkdir(parentPath);
      parent = this.resolveNode(parentPath);
    }

    if (parent.type !== 'dir') throw new Error(`vfs: ${parentPath}: Not a directory`);
    parent.children[filename] = {
      type: 'file',
      content: String(content),
      modifiedAt: new Date().toISOString()
    };
    return true;
  }

  mkdir(pathStr, cwd = '/home/varshan') {
    const norm = this.normalizePath(pathStr, cwd);
    const segments = norm.split('/').filter(Boolean);
    let curr = this.root;

    for (const seg of segments) {
      if (!curr.children[seg]) {
        curr.children[seg] = { type: 'dir', children: {}, createdAt: new Date().toISOString() };
      }
      curr = curr.children[seg];
    }
    return true;
  }

  listDir(pathStr, cwd = '/home/varshan') {
    const node = this.resolveNode(pathStr, cwd);
    if (!node) throw new Error(`vfs: ${pathStr}: No such file or directory`);
    if (node.type !== 'dir') throw new Error(`vfs: ${pathStr}: Not a directory`);

    return Object.keys(node.children).map(name => ({
      name,
      type: node.children[name].type,
      size: node.children[name].content ? node.children[name].content.length : 0
    }));
  }

  remove(pathStr, cwd = '/home/varshan') {
    const norm = this.normalizePath(pathStr, cwd);
    if (norm === '/') throw new Error('vfs: cannot remove root directory /');

    const segments = norm.split('/').filter(Boolean);
    const filename = segments.pop();
    const parentPath = '/' + segments.join('/');

    const parent = this.resolveNode(parentPath);
    if (!parent || !parent.children[filename]) {
      throw new Error(`vfs: ${pathStr}: No such file or directory`);
    }

    delete parent.children[filename];
    return true;
  }
}
