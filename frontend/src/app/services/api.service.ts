import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Task, Child, Reward, Badge, LeaderboardEntry } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Tasks
  getTasks() { return this.http.get<Task[]>(`${this.api}/tasks`); }
  createTask(task: Partial<Task>) { return this.http.post<Task>(`${this.api}/tasks`, task); }
  updateTask(id: string, task: Partial<Task>) { return this.http.put<Task>(`${this.api}/tasks/${id}`, task); }
  deleteTask(id: string) { return this.http.delete(`${this.api}/tasks/${id}`); }
  completeTask(id: string) { return this.http.post<any>(`${this.api}/tasks/${id}/complete`, {}); }
  uncompleteTask(id: string) { return this.http.post<any>(`${this.api}/tasks/${id}/uncomplete`, {}); }
  stealTask(id: string) { return this.http.post<any>(`${this.api}/tasks/${id}/steal`, {}); }

  // Children
  getChildren() { return this.http.get<Child[]>(`${this.api}/children`); }
  getChild(id: string) { return this.http.get<Child>(`${this.api}/children/${id}`); }
  createChild(data: Partial<Child>) { return this.http.post<Child>(`${this.api}/children`, data); }
  updateChild(id: string, data: Partial<Child>) { return this.http.put<Child>(`${this.api}/children/${id}`, data); }
  deleteChild(id: string) { return this.http.delete(`${this.api}/children/${id}`); }

  // Rewards
  getRewards() { return this.http.get<Reward[]>(`${this.api}/rewards`); }
  createReward(data: Partial<Reward>) { return this.http.post<Reward>(`${this.api}/rewards`, data); }
  updateReward(id: string, data: Partial<Reward>) { return this.http.put<Reward>(`${this.api}/rewards/${id}`, data); }
  deleteReward(id: string) { return this.http.delete(`${this.api}/rewards/${id}`); }
  claimReward(id: string) { return this.http.post<any>(`${this.api}/rewards/${id}/claim`, {}); }

  // Other
  getLeaderboard() { return this.http.get<LeaderboardEntry[]>(`${this.api}/leaderboard`); }
  getBadges(childId: string) { return this.http.get<Badge[]>(`${this.api}/badges/${childId}`); }
  getWeekOverview() { return this.http.get<any[]>(`${this.api}/week-overview`); }
}
