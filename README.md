# 🌌 AetherOS

> **Sovereign In-Browser Micro-Kernel Operating System & WebGPU Compositor.**  
> *A full Unix VFS, preemptive process scheduler, terminal emulator, and multitasking desktop environment running completely inside your browser.*  
> An open-source flagship system by **[Velorio Labs](https://github.com/VelorioLabs)**.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Kernel](https://img.shields.io/badge/Kernel-v1.0%20Micro--Kernel-ccff00.svg)](https://veloriolabs.github.io/aetheros)
[![Compositor](https://img.shields.io/badge/Compositor-Glassmorphism%20Multitask-sky.svg)](https://veloriolabs.github.io/aetheros)
[![Live Demo](https://img.shields.io/badge/Live%20OS-veloriolabs.github.io%2Faetheros-white)](https://veloriolabs.github.io/aetheros)
[![Org](https://img.shields.io/badge/VelorioLabs-Flagship-indigo)](https://github.com/VelorioLabs)

---

## ⚡ Core Architecture

```
                    ┌───────────────────────────────┐
                    │ AetherOS Window Compositor    │
                    └───────────────┬───────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
[ AetherTerm (Shell) ]     [ Task Manager (top) ]       [ Velorio Native Apps ]
    │                               │                               │
    └───────────────────────────────┼───────────────────────────────┘
                                    ▼
                    ┌───────────────────────────────┐
                    │ Preemptive Process Scheduler  │
                    └───────────────┬───────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
[ Unix VFS (/bin, /home, /proc) ]             [ Virtual Memory Manager (8GB) ]
```

---

## 🚀 Key Features

1. **Unix Virtual File System (VFS)**: Complete directory structure (`/bin`, `/home/varshan`, `/etc`, `/proc`, `/dev`) with path resolution and file operations.
2. **Preemptive Process Scheduler**: Tracks active processes, assigns PIDs, calculates real-time CPU/RAM footprint, and handles Unix signals (`kill -9`).
3. **AetherTerm Shell**: Full terminal supporting pipe operators (`ps | grep`), file redirection (`echo "text" > file.txt`), and commands (`neofetch`, `top`, `ps`, `ls`, `cat`, `matrix`).
4. **Multitasking Window Compositor**: Draggable, resizable, minimizable, maximizable windows with glassmorphic blur and an interactive floating dock.
5. **Integrated Native App Ecosystem**: Runs **OmniGrab**, **CloudFuse**, and **AetherStream** natively inside the OS.

---

## 🛠️ Quickstart

```bash
git clone https://github.com/VelorioLabs/AetherOS.git
cd AetherOS
npm test
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
