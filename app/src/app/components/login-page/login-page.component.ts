import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  standalone: true
})
export class LoginPageComponent implements OnInit {
  public email: string = '';
  public password: string = '';
  public error: string = '';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userService.user$.subscribe(user => {
      if (user && user.is_anonymous == false) {
        this.router.navigate(['/']);
        console.log('You are already logged in, redirecting to home page');
      }
    });

    console.log('LoginPageComponent initialized');

    const anonSessionExists = await this.supabaseService.checkAnonSession();
    if (!anonSessionExists) {
      this.supabaseService.saveAnonSession();
    }
  }

  async handleLogin(event: Event): Promise<void> {
    event.preventDefault();
    const { data, error } = await this.supabaseService.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    if (error) {
      this.error = 'Invalid email or password. Please try again.';
      console.error('Login error', error);
      return;
    }
    this.error = '';

    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/']).then(() => {
        this.reloadPage();
      });
    }else {
      this.router.navigate(['/']);
    }
  }

  reloadPage(): void {
    window.location.reload();
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
    console.log('Navigating to home');
  }
}
