import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _count = signal(0);
  readonly isLoading = signal(false);

  show(): void {
    this._count.update(c => c + 1);
    this.isLoading.set(true);
  }

  hide(): void {
    this._count.update(c => Math.max(0, c - 1));
    if (this._count() === 0) this.isLoading.set(false);
  }

  // For route transitions: force show for minimum duration
  pulse(duration = 600): void {
    this.show();
    setTimeout(() => this.hide(), duration);
  }
}
