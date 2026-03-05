import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Child } from '../../models/interfaces';

@Component({
  selector: 'app-select-child',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="card max-w-lg w-full text-center">
        <h2 class="text-2xl font-bold mb-6">Wie ben jij? 🦸</h2>

        <div class="grid grid-cols-2 gap-4 mb-6">
          @for (child of children(); track child.id) {
            <button (click)="selectChild(child)"
              class="card hover:border-purple-400/60 transition-all p-6 flex flex-col items-center gap-2">
              <span class="text-4xl">{{ child.avatar }}</span>
              <span class="font-semibold">{{ child.name }}</span>
              <span class="text-xs text-gray-400">Level {{ child.level }}</span>
            </button>
          }
        </div>

        <div class="flex gap-4 justify-center">
          <button (click)="goToParent()" class="btn-primary">
            👨‍👩‍👧 Ouder Dashboard
          </button>
          <button (click)="logout()" class="btn-secondary">
            🚪 Uitloggen
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SelectChildComponent implements OnInit {
  children = signal<Child[]>([]);

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.api.getChildren().subscribe(kids => this.children.set(kids));
  }

  selectChild(child: Child) {
    this.auth.selectChild(child.id).subscribe({
      next: (res) => {
        this.auth.setSession(res.token, 'child', this.auth.familyId()!, child.id);
        this.router.navigate(['/child']);
      },
    });
  }

  goToParent() { this.router.navigate(['/parent']); }
  logout() { this.auth.logout(); }
}
