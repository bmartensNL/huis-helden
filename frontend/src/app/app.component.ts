import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="relative z-10 min-h-screen">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {}
