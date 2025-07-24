import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-angular-project';
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ScmDashboardComponent } from './components/scm-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, ScmDashboardComponent],
  template: `
    <div class="app-container">
      <app-scm-dashboard></app-scm-dashboard>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'Blockchain SCM Dashboard';
}
</component>
