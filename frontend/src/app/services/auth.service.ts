import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  token = signal<string | null>(localStorage.getItem('hh_token'));
  role = signal<string | null>(localStorage.getItem('hh_role'));
  familyId = signal<string | null>(localStorage.getItem('hh_familyId'));
  childId = signal<string | null>(localStorage.getItem('hh_childId'));

  constructor(private http: HttpClient, private router: Router) {}

  register(pin: string) {
    return this.http.post<{ token: string; familyId: string }>(`${this.apiUrl}/auth/register`, { pin });
  }

  parentLogin(familyId: string, pin: string) {
    return this.http.post<{ token: string; familyId: string }>(`${this.apiUrl}/auth/parent-login`, { familyId, pin });
  }

  selectChild(childId: string) {
    return this.http.post<{ token: string; child: any }>(`${this.apiUrl}/auth/child-select`, { childId });
  }

  getChildren(familyId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/auth/children/${familyId}`);
  }

  setSession(token: string, role: 'parent' | 'child', familyId: string, childId?: string) {
    this.token.set(token);
    this.role.set(role);
    this.familyId.set(familyId);
    this.childId.set(childId || null);
    localStorage.setItem('hh_token', token);
    localStorage.setItem('hh_role', role);
    localStorage.setItem('hh_familyId', familyId);
    if (childId) localStorage.setItem('hh_childId', childId);
  }

  logout() {
    this.token.set(null);
    this.role.set(null);
    this.familyId.set(null);
    this.childId.set(null);
    localStorage.removeItem('hh_token');
    localStorage.removeItem('hh_role');
    localStorage.removeItem('hh_familyId');
    localStorage.removeItem('hh_childId');
    this.router.navigate(['/']);
  }

  isParent(): boolean { return this.role() === 'parent'; }
  isChild(): boolean { return this.role() === 'child'; }
  isAuthenticated(): boolean { return !!this.token(); }
}
