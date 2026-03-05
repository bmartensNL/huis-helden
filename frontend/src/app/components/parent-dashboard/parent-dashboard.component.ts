import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Task, Child, Reward } from '../../models/interfaces';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🦸 HuisHelden — Ouder Dashboard
        </h1>
        <div class="flex gap-2">
          <button (click)="switchToChild()" class="btn-secondary text-sm">👶 Kind Selectie</button>
          <button (click)="logout()" class="btn-secondary text-sm">🚪</button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-2 mb-6 overflow-x-auto">
        @for (t of tabs; track t.id) {
          <button (click)="activeTab.set(t.id)"
            [class]="activeTab() === t.id ? 'btn-primary text-sm py-2 px-4' : 'btn-secondary text-sm py-2 px-4'">
            {{ t.emoji }} {{ t.label }}
          </button>
        }
      </div>

      <!-- Children Tab -->
      @if (activeTab() === 'children') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          @for (child of children(); track child.id) {
            <div class="card">
              <div class="flex items-center gap-3 mb-3">
                <span class="text-3xl">{{ child.avatar }}</span>
                <div>
                  <h3 class="font-bold">{{ child.name }}</h3>
                  <p class="text-sm text-gray-400">Level {{ child.level }} — {{ child.levelTitle }}</p>
                </div>
                <button (click)="deleteChild(child.id)" class="ml-auto text-red-400 hover:text-red-300">🗑️</button>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center text-sm">
                <div class="bg-space-900/50 rounded-lg p-2">
                  <p class="text-purple-300 font-bold">{{ child.xp }}</p><p class="text-gray-500">XP</p>
                </div>
                <div class="bg-space-900/50 rounded-lg p-2">
                  <p class="text-yellow-300 font-bold">{{ child.coins }}</p><p class="text-gray-500">Munten</p>
                </div>
                <div class="bg-space-900/50 rounded-lg p-2">
                  <p class="text-orange-300 font-bold">{{ child.streak }}</p><p class="text-gray-500">Streak</p>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Add Child Form -->
        <div class="card">
          <h3 class="font-bold mb-3">➕ Kind Toevoegen</h3>
          <div class="flex gap-3">
            <input [(ngModel)]="newChildName" placeholder="Naam"
              class="flex-1 p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500" />
            <select [(ngModel)]="newChildAvatar"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white text-2xl">
              @for (a of avatars; track a) { <option [value]="a">{{ a }}</option> }
            </select>
            <button (click)="addChild()" class="btn-primary">Toevoegen</button>
          </div>
        </div>
      }

      <!-- Tasks Tab -->
      @if (activeTab() === 'tasks') {
        <div class="space-y-3 mb-6">
          @for (task of tasks(); track task.id) {
            <div class="card flex items-center gap-4">
              <span class="text-2xl">{{ task.emoji }}</span>
              <div class="flex-1">
                <h3 class="font-semibold">{{ task.name }}</h3>
                <div class="flex gap-2 text-xs text-gray-400">
                  <span>+{{ task.xp }} XP</span>
                  <span>+{{ task.coins }} 🪙</span>
                  <span class="capitalize">{{ task.difficulty }}</span>
                  @if (task.recurring) { <span>🔄 {{ task.recurring }}</span> }
                  @if (task.assignedTo) { <span>→ {{ task.assignedTo.avatar }} {{ task.assignedTo.name }}</span> }
                </div>
              </div>
              <button (click)="deleteTask(task.id)" class="text-red-400 hover:text-red-300">🗑️</button>
            </div>
          }
        </div>

        <!-- Add Task Form -->
        <div class="card">
          <h3 class="font-bold mb-3">➕ Taak Toevoegen</h3>
          <div class="grid grid-cols-2 gap-3">
            <input [(ngModel)]="newTask.name" placeholder="Taaknaam"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500" />
            <select [(ngModel)]="newTask.emoji"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white text-xl">
              @for (e of taskEmojis; track e) { <option [value]="e">{{ e }}</option> }
            </select>
            <input [(ngModel)]="newTask.xp" type="number" placeholder="XP"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500" />
            <input [(ngModel)]="newTask.coins" type="number" placeholder="Munten"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500" />
            <select [(ngModel)]="newTask.difficulty"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white">
              <option value="easy">Makkelijk</option>
              <option value="medium">Gemiddeld</option>
              <option value="hard">Moeilijk</option>
            </select>
            <select [(ngModel)]="newTask.recurring"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white">
              <option value="">Eenmalig</option>
              <option value="daily">Dagelijks</option>
              <option value="weekly">Wekelijks</option>
              <option value="weekdays">Doordeweeks</option>
              <option value="weekend">Weekend</option>
            </select>
            <select [(ngModel)]="newTask.assignedToId"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white">
              <option value="">Iedereen</option>
              @for (c of children(); track c.id) {
                <option [value]="c.id">{{ c.avatar }} {{ c.name }}</option>
              }
            </select>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [(ngModel)]="newTask.isBonus" class="rounded" /> ⭐ Bonus Taak
            </label>
          </div>
          <button (click)="addTask()" class="btn-primary mt-3 w-full">Taak Toevoegen</button>
        </div>
      }

      <!-- Rewards Tab -->
      @if (activeTab() === 'rewards') {
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          @for (reward of rewards(); track reward.id) {
            <div class="card text-center">
              <span class="text-3xl">{{ reward.emoji }}</span>
              <h3 class="font-semibold mt-1">{{ reward.name }}</h3>
              <p class="text-cosmic-gold">{{ reward.cost }} 🪙</p>
              <button (click)="deleteReward(reward.id)" class="text-red-400 hover:text-red-300 text-sm mt-2">🗑️ Verwijder</button>
            </div>
          }
        </div>

        <div class="card">
          <h3 class="font-bold mb-3">➕ Beloning Toevoegen</h3>
          <div class="flex gap-3">
            <select [(ngModel)]="newReward.emoji"
              class="p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white text-xl">
              @for (e of rewardEmojis; track e) { <option [value]="e">{{ e }}</option> }
            </select>
            <input [(ngModel)]="newReward.name" placeholder="Naam"
              class="flex-1 p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500" />
            <input [(ngModel)]="newReward.cost" type="number" placeholder="Kosten"
              class="w-24 p-2 bg-space-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500" />
            <button (click)="addReward()" class="btn-primary">Toevoegen</button>
          </div>
        </div>
      }

      <!-- Week Overview Tab -->
      @if (activeTab() === 'overview') {
        <div class="space-y-4">
          @for (child of weekOverview(); track child.id) {
            <div class="card">
              <div class="flex items-center gap-3 mb-3">
                <span class="text-2xl">{{ child.avatar }}</span>
                <h3 class="font-bold">{{ child.name }}</h3>
              </div>
              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="bg-space-900/50 rounded-lg p-3">
                  <p class="text-2xl font-bold text-purple-300">{{ child.tasksThisWeek }}</p>
                  <p class="text-xs text-gray-500">Taken</p>
                </div>
                <div class="bg-space-900/50 rounded-lg p-3">
                  <p class="text-2xl font-bold text-blue-300">{{ child.xpThisWeek }}</p>
                  <p class="text-xs text-gray-500">XP</p>
                </div>
                <div class="bg-space-900/50 rounded-lg p-3">
                  <p class="text-2xl font-bold text-yellow-300">{{ child.coinsThisWeek }}</p>
                  <p class="text-xs text-gray-500">Munten</p>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ParentDashboardComponent implements OnInit {
  activeTab = signal('children');
  children = signal<Child[]>([]);
  tasks = signal<Task[]>([]);
  rewards = signal<Reward[]>([]);
  weekOverview = signal<any[]>([]);

  tabs = [
    { id: 'children', emoji: '👶', label: 'Kinderen' },
    { id: 'tasks', emoji: '📋', label: 'Taken' },
    { id: 'rewards', emoji: '🎁', label: 'Beloningen' },
    { id: 'overview', emoji: '📊', label: 'Weekoverzicht' },
  ];

  avatars = ['🦸', '🧙', '🦹', '🧝', '🧜', '🦊', '🐱', '🐶', '🦄', '🐉', '🤖', '👽'];
  taskEmojis = ['📋', '🧹', '🍳', '🛏️', '🐕', '📚', '🗑️', '🧺', '🚿', '🌱', '🍽️', '🧽'];
  rewardEmojis = ['🎁', '🍕', '🎮', '📱', '🍦', '🎬', '🛒', '⏰', '🎪', '🏊'];

  newChildName = '';
  newChildAvatar = '🦸';
  newTask: any = { name: '', emoji: '📋', xp: 10, coins: 1, difficulty: 'easy', recurring: '', assignedToId: '', isBonus: false };
  newReward: any = { emoji: '🎁', name: '', cost: 5 };

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.api.getChildren().subscribe(c => this.children.set(c));
    this.api.getTasks().subscribe(t => this.tasks.set(t));
    this.api.getRewards().subscribe(r => this.rewards.set(r));
    this.api.getWeekOverview().subscribe(w => this.weekOverview.set(w));
  }

  addChild() {
    if (!this.newChildName) return;
    this.api.createChild({ name: this.newChildName, avatar: this.newChildAvatar }).subscribe(() => {
      this.newChildName = '';
      this.loadData();
    });
  }

  deleteChild(id: string) {
    if (confirm('Kind verwijderen?')) {
      this.api.deleteChild(id).subscribe(() => this.loadData());
    }
  }

  addTask() {
    if (!this.newTask.name) return;
    const data = { ...this.newTask };
    if (!data.assignedToId) delete data.assignedToId;
    if (!data.recurring) delete data.recurring;
    this.api.createTask(data).subscribe(() => {
      this.newTask = { name: '', emoji: '📋', xp: 10, coins: 1, difficulty: 'easy', recurring: '', assignedToId: '', isBonus: false };
      this.loadData();
    });
  }

  deleteTask(id: string) {
    this.api.deleteTask(id).subscribe(() => this.loadData());
  }

  addReward() {
    if (!this.newReward.name) return;
    this.api.createReward(this.newReward).subscribe(() => {
      this.newReward = { emoji: '🎁', name: '', cost: 5 };
      this.loadData();
    });
  }

  deleteReward(id: string) {
    this.api.deleteReward(id).subscribe(() => this.loadData());
  }

  switchToChild() { this.router.navigate(['/select-child']); }
  logout() { this.auth.logout(); }
}
