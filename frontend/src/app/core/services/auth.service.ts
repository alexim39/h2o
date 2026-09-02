import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, catchError, of } from 'rxjs';

const AUTH_KEY = 'h2os_mgt_auth_v1';
const AUTH_USER_KEY = 'h2os_mgt_user_v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly _authed = signal<boolean>(this.load());
  private readonly _user = signal<string | null>(this.loadUser());
  readonly isAuthed = this._authed.asReadonly();
  readonly username = this._user.asReadonly();
  readonly isAdmin = computed(() => this._authed());

  private load(): boolean {
    try { return localStorage.getItem(AUTH_KEY) === '1'; } catch { return false; }
  }
  private loadUser(): string | null {
    try { return localStorage.getItem(AUTH_USER_KEY); } catch { return null; }
  }

  /** DB-managed login — POST /admin/login {username,password} */
  async login(user: string, pass: string): Promise<boolean> {
    const username = user.trim();
    const password = pass;
    if (!username || !password) return false;
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/admin/login`, { username, password }).pipe(catchError(() => of(null)))
      );
      // Backend returns {status:true, data:{username}} on success, {status:false} on 401
      const ok = !!(res && res.status === true);
      if (ok) {
        this._authed.set(true);
        this._user.set(res.data?.username ?? username);
        try {
          localStorage.setItem(AUTH_KEY, '1');
          localStorage.setItem(AUTH_USER_KEY, res.data?.username ?? username);
        } catch {}
        return true;
      }
      // Fallback: if API unreachable but local DB not yet seeded, allow legacy env check via API already handled server-side
      return false;
    } catch {
      return false;
    }
  }

  // Keep sync wrapper for guards that expect boolean quickly (checks localStorage only)
  check(): boolean { return this._authed(); }

  logout(): void {
    this._authed.set(false);
    this._user.set(null);
    try { localStorage.removeItem(AUTH_KEY); localStorage.removeItem(AUTH_USER_KEY); } catch {}
  }
}
