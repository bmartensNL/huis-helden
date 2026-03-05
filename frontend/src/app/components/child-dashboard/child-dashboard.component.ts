import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Child, Task, Badge, LeaderboardEntry, Reward } from '../../models/interfaces';

@Component({
  selector: 'app-child-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-4 pb-24">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          HuisHelden
        </h1>
        <button (click)="logout()" class="text-gray-400 hover:text-white">🚪</button>
      </div>

      @if (child()) {
        <!-- Hero Card -->
        <div class="card-glow mb-6">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-5xl animate-float">{{ child()!.avatar }}</span>
            <div class="flex-1">
              <h2 class="text-xl font-bold">{{ child()!.name }}</h2>
              <p class="text-purple-300 text-sm">{{ child()!.levelTitle }} — Level {{ child()!.level }}</p>
              <div class="flex gap-4 mt-1 text-sm">
                <span>🔥 {{ child()!.streak }} streak</span>
                <span>🪙 {{ child()!.coins }} munten</span>
                <span>✅ {{ todayCount() }} vandaag</span>
              </div>
            </div>
          </div>
          <!-- XP Bar -->
          <div class="xp-bar">
            <div class="xp-bar-fill" [style.width.%]="xpPercent()"></div>
          </div>
          <p class="text-xs text-gray-400 mt-1 text-right">{{ child()!.xp }} / {{ child()!.maxXp }} XP</p>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-2 mb-4 overflow-x-auto">
          @for (t of tabs; track t.id) {
            <button (click)="activeTab.set(t.id)"
              [class]="activeTab() === t.id ? 'btn-primary text-sm py-2 px-4' : 'btn-secondary text-sm py-2 px-4'">
              {{ t.emoji }} {{ t.label }}
            </button>
          }
        </div>

        <!-- Tasks Tab -->
        @if (activeTab() === 'tasks') {
          <!-- Filter -->
          <div class="flex gap-2 mb-4">
            @for (f of filters; track f.id) {
              <button (click)="filter.set(f.id)"
                [class]="filter() === f.id ? 'badge-earned' : 'badge-locked'"
                class="cursor-pointer">
                {{ f.label }}
              </button>
            }
          </div>

          <div class="space-y-3">
            @for (task of filteredTasks(); track task.id) {
              <div class="task-card" [class.completed]="isCompleted(task)" (click)="toggleTask(task)">
                <span class="text-3xl">{{ task.emoji }}</span>
                <div class="flex-1">
                  <h3 class="font-semibold">{{ task.name }}</h3>
                  <div class="flex gap-2 text-xs text-gray-400">
                    <span>+{{ task.xp }} XP</span>
                    <span>+{{ task.coins }} 🪙</span>
                    <span class="capitalize">{{ task.difficulty }}</span>
                    @if (task.isBonus) { <span class="text-yellow-400">⭐ Bonus</span> }
                  </div>
                </div>
                <div class="text-2xl">
                  {{ isCompleted(task) ? '✅' : '⬜' }}
                </div>
              </div>
            }
            @empty {
              <p class="text-center text-gray-500 py-8">Geen taken gevonden 🎉</p>
            }
          </div>
        }

        <!-- Badges Tab -->
        @if (activeTab() === 'badges') {
          <div class="grid grid-cols-2 gap-4">
            @for (badge of badges(); track badge.type) {
              <div [class]="badge.earned ? 'card border-purple-400/40' : 'card opacity-50'">
                <div class="text-center">
                  <span class="text-4xl">{{ badge.emoji }}</span>
                  <h3 class="font-semibold mt-2">{{ badge.name }}</h3>
                  <p class="text-xs text-gray-400">{{ badge.description }}</p>
                  @if (badge.earned) {
                    <span class="badge-earned text-xs mt-2">Verdiend! ✨</span>
                  } @else {
                    <span class="badge-locked text-xs mt-2">🔒 Vergrendeld</span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Leaderboard Tab -->
        @if (activeTab() === 'leaderboard') {
          <div class="space-y-3">
            @for (entry of leaderboard(); track entry.id) {
              <div class="card flex items-center gap-4">
                <span class="text-2xl font-bold text-purple-400 w-8">{{ entry.rank }}</span>
                <span class="text-3xl">{{ entry.avatar }}</span>
                <div class="flex-1">
                  <h3 class="font-semibold">{{ entry.name }}</h3>
                  <p class="text-xs text-gray-400">{{ entry.levelTitle }} — Level {{ entry.level }}</p>
                </div>
                <div class="text-right text-sm">
                  <p class="text-purple-300">{{ entry.totalCompletions }} taken</p>
                  <p class="text-gray-400">🔥 {{ entry.streak }}</p>
                </div>
              </div>
            }
          </div>
        }

        <!-- Rewards Tab -->
        @if (activeTab() === 'rewards') {
          <div class="grid grid-cols-2 gap-4">
            @for (reward of rewards(); track reward.id) {
              <div class="card text-center">
                <span class="text-4xl">{{ reward.emoji }}</span>
                <h3 class="font-semibold mt-2">{{ reward.name }}</h3>
                <p class="text-cosmic-gold font-bold">{{ reward.cost }} 🪙</p>
                <button (click)="claimReward(reward)"
                  [disabled]="child()!.coins < reward.cost"
                  [class]="child()!.coins >= reward.cost ? 'btn-primary text-sm mt-2 w-full' : 'btn-secondary text-sm mt-2 w-full opacity-50'">
                  {{ child()!.coins >= reward.cost ? '🎁 Claim!' : '🔒 Te weinig munten' }}
                </button>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class ChildDashboardComponent implements OnInit {
  child = signal<Child | null>(null);
  tasks = signal<Task[]>([]);
  badges = signal<Badge[]>([]);
  leaderboard = signal<LeaderboardEntry[]>([]);
  rewards = signal<Reward[]>([]);
  activeTab = signal('tasks');
  filter = signal('all');

  tabs = [
    { id: 'tasks', emoji: '📋', label: 'Taken' },
    { id: 'badges', emoji: '🏅', label: 'Badges' },
    { id: 'leaderboard', emoji: '🏆', label: 'Ranglijst' },
    { id: 'rewards', emoji: '🎁', label: 'Beloningen' },
  ];

  filters = [
    { id: 'all', label: 'Alles' },
    { id: 'easy', label: '🟢 Makkelijk' },
    { id: 'hard', label: '🔴 Moeilijk' },
    { id: 'done', label: '✅ Klaar' },
  ];

  filteredTasks = computed(() => {
    const f = this.filter();
    const tasks = this.tasks();
    if (f === 'easy') return tasks.filter(t => t.difficulty === 'easy');
    if (f === 'hard') return tasks.filter(t => t.difficulty === 'hard');
    if (f === 'done') return tasks.filter(t => this.isCompleted(t));
    return tasks;
  });

  todayCount = computed(() => this.tasks().filter(t => this.isCompleted(t)).length);
  xpPercent = computed(() => {
    const c = this.child();
    return c ? Math.min(100, (c.xp / c.maxXp) * 100) : 0;
  });

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    const childId = this.auth.childId()!;
    this.api.getChild(childId).subscribe(c => this.child.set(c));
    this.api.getTasks().subscribe(t => this.tasks.set(t));
    this.api.getBadges(childId).subscribe(b => this.badges.set(b));
    this.api.getLeaderboard().subscribe(l => this.leaderboard.set(l));
    this.api.getRewards().subscribe(r => this.rewards.set(r));
  }

  isCompleted(task: Task): boolean {
    return !!task.completions?.some(c => c.childId === this.auth.childId());
  }

  toggleTask(task: Task) {
    const obs = this.isCompleted(task) ? this.api.uncompleteTask(task.id) : this.api.completeTask(task.id);
    obs.subscribe({
      next: (res) => {
        if (res.child) this.child.set(res.child);
        this.loadData();
      },
    });
  }

  claimReward(reward: Reward) {
    this.api.claimReward(reward.id).subscribe({
      next: (res) => {
        if (res.child) this.child.set(res.child);
      },
    });
  }

  logout() { this.auth.logout(); }
}
