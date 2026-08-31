/**
 * Virtual Memory Allocator & RAM Telemetry
 * Developed by Velorio Labs (https://github.com/VelorioLabs)
 */

export class VirtualMemory {
  constructor(totalMb = 8192) {
    this.totalMb = totalMb;
    this.allocatedMb = 1420;
  }

  getMetrics() {
    // Simulated realistic RAM usage
    this.allocatedMb = Math.min(this.totalMb - 1024, Math.max(1200, this.allocatedMb + (Math.random() * 20 - 10)));
    const freeMb = this.totalMb - this.allocatedMb;
    const percentUsed = ((this.allocatedMb / this.totalMb) * 100).toFixed(1);

    return {
      totalMb: this.totalMb,
      allocatedMb: Number(this.allocatedMb.toFixed(1)),
      freeMb: Number(freeMb.toFixed(1)),
      percentUsed
    };
  }
}
