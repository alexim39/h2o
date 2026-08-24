import { Injectable, signal, computed } from '@angular/core';

const AUTH_KEY = 'h2os_mgt_auth_v1';
// In production replace with backend validation; for now mock secure client-side gate
const ADMIN_USER = 'h2os';
const ADMIN_PASS = 'UltraH2@2025'; // change in .env for real deployment — backend should validate

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _authed = signal<boolean>(this.load());
  readonly isAuthed = this._authed.asReadonly();
  readonly isAdmin = computed(() => this._authed());

  private load(): boolean {
    try { return localStorage.getItem(AUTH_KEY) === '1'; } catch { return false; }
  }

  login(user: string, pass: string): boolean {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      this._authed.set(true);
      try { localStorage.setItem(AUTH_KEY, '1'); } catch {}
      return true;
    }
    return false;
  }

  logout(): void {
    this._authed.set(false);
    try { localStorage.removeItem(AUTH_KEY); } catch {}
  }

  // For guard
  check(): boolean { return this._authed(); }
}
