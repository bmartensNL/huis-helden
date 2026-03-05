import { Routes } from '@angular/router';
import { parentGuard } from './guards/parent.guard';
import { childGuard } from './guards/child.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'select-child',
    loadComponent: () => import('./components/auth/select-child.component').then(m => m.SelectChildComponent),
  },
  {
    path: 'parent',
    canActivate: [parentGuard],
    loadComponent: () => import('./components/parent-dashboard/parent-dashboard.component').then(m => m.ParentDashboardComponent),
  },
  {
    path: 'child',
    canActivate: [childGuard],
    loadComponent: () => import('./components/child-dashboard/child-dashboard.component').then(m => m.ChildDashboardComponent),
  },
  { path: '**', redirectTo: '' },
];
