import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="card max-w-md w-full text-center">
        <div class="text-6xl mb-4 animate-float">🦸</div>
        <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          HuisHelden
        </h1>
        <p class="text-gray-400 mb-8">Word een Huishoud Held!</p>

        @if (mode() === 'choose') {
          <div class="space-y-4">
            <button (click)="mode.set('login')" class="btn-primary w-full">
              🔑 Inloggen met PIN
            </button>
            <button (click)="mode.set('register')" class="btn-secondary w-full">
              ✨ Nieuw Gezin Aanmaken
            </button>
          </div>
        }

        @if (mode() === 'login') {
          <div class="space-y-4">
            <input [(ngModel)]="familyId" placeholder="Gezins-ID"
              class="w-full p-3 bg-space-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400" />
            <div class="flex gap-2 justify-center">
              @for (i of [0,1,2,3]; track i) {
                <input [(ngModel)]="pinDigits[i]" maxlength="1" type="password"
                  class="w-14 h-14 text-center text-2xl bg-space-900 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  (input)="onPinInput($event, i)" />
              }
            </div>
            <button (click)="login()" class="btn-primary w-full" [disabled]="loading()">
              {{ loading() ? '⏳' : '🚀' }} Inloggen
            </button>
            @if (error()) {
              <p class="text-red-400 text-sm">{{ error() }}</p>
            }
            <button (click)="mode.set('choose')" class="text-gray-400 hover:text-white text-sm">← Terug</button>
          </div>
        }

        @if (mode() === 'register') {
          <div class="space-y-4">
            <p class="text-gray-300">Kies een 4-cijferige PIN:</p>
            <div class="flex gap-2 justify-center">
              @for (i of [0,1,2,3]; track i) {
                <input [(ngModel)]="pinDigits[i]" maxlength="1" type="password"
                  class="w-14 h-14 text-center text-2xl bg-space-900 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  (input)="onPinInput($event, i)" />
              }
            </div>
            <button (click)="register()" class="btn-primary w-full" [disabled]="loading()">
              {{ loading() ? '⏳' : '🎉' }} Gezin Aanmaken
            </button>
            @if (error()) {
              <p class="text-red-400 text-sm">{{ error() }}</p>
            }
            @if (successId()) {
              <div class="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <p class="text-green-400 font-semibold">Gezin aangemaakt!</p>
                <p class="text-sm text-gray-300 mt-1">Bewaar je Gezins-ID:</p>
                <p class="font-mono text-xs bg-space-900 p-2 rounded mt-1 select-all">{{ successId() }}</p>
              </div>
            }
            <button (click)="mode.set('choose')" class="text-gray-400 hover:text-white text-sm">← Terug</button>
          </div>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  mode = signal<'choose' | 'login' | 'register'>('choose');
  familyId = '';
  pinDigits = ['', '', '', ''];
  loading = signal(false);
  error = signal('');
  successId = signal('');

  constructor(private auth: AuthService, private router: Router) {
    // Auto-login if session exists
    if (auth.isParent()) this.router.navigate(['/parent']);
    if (auth.isChild()) this.router.navigate(['/child']);
  }

  get pin(): string { return this.pinDigits.join(''); }

  onPinInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 3) {
      const next = input.parentElement?.children[index + 1] as HTMLInputElement;
      next?.focus();
    }
  }

  login() {
    this.loading.set(true);
    this.error.set('');
    this.auth.parentLogin(this.familyId, this.pin).subscribe({
      next: (res) => {
        this.auth.setSession(res.token, 'parent', res.familyId);
        this.router.navigate(['/select-child']);
      },
      error: () => {
        this.error.set('Ongeldige PIN of Gezins-ID');
        this.loading.set(false);
      },
    });
  }

  register() {
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.pin).subscribe({
      next: (res) => {
        this.auth.setSession(res.token, 'parent', res.familyId);
        this.successId.set(res.familyId);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Registratie mislukt');
        this.loading.set(false);
      },
    });
  }
}
