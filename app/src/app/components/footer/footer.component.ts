import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [CommonModule]
})

export class FooterComponent implements OnInit {
  public loginStatus: boolean = false;
  private currentUrl: string = '';
  public linkLabel: string = 'Login';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private cookieService: CookieService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit():void {
    // this.currentUrl = this.router.url;
    // this.updateLinkLabel();

    this.userService.user$.subscribe(user => {
      if (user && user.is_anonymous === false) {
        console.log('[Footer] Got user ID:', user.id);
        this.loginStatus = true;
      } else {
        console.log('[Footer] User not ready yet');
        this.loginStatus = false;
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.updateLinkLabel();
      }
    });
  }

  updateLinkLabel():void {
    if (this.currentUrl === '/') {
      this.linkLabel = 'Login';
    } else if (this.currentUrl === '/login') {
      this.linkLabel = 'Back';
    } else {
      this.linkLabel = '';
    }
  }

  navigateToLoginOrHome():void {
    if (this.currentUrl === '/') {
      this.router.navigate(['/login']);
    } else if (this.currentUrl === '/login') {
      this.router.navigate(['/']);
    }
    const liChat = document.querySelector('li.selected');
    liChat?.classList.remove('selected');
  }

  showLogout():void {
    const showWindowLogout = document.querySelector('.sureLogout');
    showWindowLogout?.classList.toggle('showLogout');
  }

  closeWindow():void {
    const showWindowLogout = document.querySelector('.sureLogout');
    showWindowLogout?.classList.toggle('showLogout');
  }

  async onLogout():Promise<void> {
    console.log('Logging out');
    const anonymousSession = JSON.parse(this.cookieService.get('anonymous-session'));
    this.supabaseService.signOut();
    this.cookieService.delete('sb:token');
    const { data, error } = await this.supabaseService.setSession(anonymousSession);

    if (error) {
      console.error('Error setting anonymous session', error);
    }
    this.loginStatus = false;

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
}