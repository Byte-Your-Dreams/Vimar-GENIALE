import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigatorComponent } from './components/navigator/navigator.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoadingService } from './services/loading.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './components/loading/loading.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, LoadingComponent , NavigatorComponent, FooterComponent, SidebarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})

export class AppComponent implements OnInit {
  public isLoading: boolean = false;

  constructor(private loadingService: LoadingService) {this.loadingService.loading$.subscribe((loading) => {
    this.isLoading = loading;
  })}
  
  ngOnInit():void {
    console.log('AppComponent initialized');
  }
  // Method to reload the page
}