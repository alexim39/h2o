import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, catchError, of } from 'rxjs';

const AUTH_KEY = 'h2os_mgt_auth_v1';
const AUTH_USER_KEY = 'h2os_mgt_user_v1';
const TOKEN_KEY = 'h2os_mgt_token_v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly _authed = signal<boolean>(this.load());
  private readonly _user = signal<string | null>(this.loadUser());
  readonly isAuthed = this._authed.asReadonly();
  readonly username = this._user.asReadonly();
  readonly isAdmin = computed(() => this._authed());

  private load(): boolean {
    try { return localStorage.getItem(AUTH_KEY) === '1' && !!localStorage.getItem(TOKEN_KEY); } catch { return false; }
  }
  private loadUser(): string | null {
    try { return localStorage.getItem(AUTH_USER_KEY); } catch { return null; }
  }

  token(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  /** DB-managed login — POST /admin/login returns {token} */
  async login(user: string, pass: string): Promise<boolean> {
    const username = user.trim();
    const password = pass;
    if (!username || !password) return false;
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/admin/login`, { username, password }).pipe(catchError(() => of(null)))
      );
      const ok = !!(res && res.status === true && res.data?.token);
      if (ok) {
        this._authed.set(true);
        this._user.set(res.data?.username ?? username);
        try {
          localStorage.setItem(AUTH_KEY, '1');
          localStorage.setItem(AUTH_USER_KEY, res.data?.username ?? username);
          localStorage.setItem(TOKEN_KEY, res.data.token);
        } catch {}
        return true;
      }
      this.logout();
      return false;
    } catch {
      return false;
    }
  }

  check(): boolean { return this._authed() && !!this.token(); }

  async logout(): Promise<void> {
    const t = this.token();
    if (t) {
      try {
        await firstValueFrom(this.http.post(`${environment.apiUrl}/admin/logout`, {}).pipe(catchError(() => of(null))));
      } catch {}
    }
    this._authed.set(false);
    this._user.set(null);
    try { localStorage.removeItem(AUTH_KEY); localStorage.removeItem(AUTH_USER_KEY); localStorage.removeItem(TOKEN_KEY); } catch {}
  }
}
