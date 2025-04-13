import { Component, OnInit } from '@angular/core';
import { Router,  } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html', 
  styleUrls: ['./navigator.component.css'],
  standalone: true,
  imports: [CommonModule]
})

export class NavigatorComponent {
  public isMenuOpen: boolean = false;
  constructor(
    private router: Router,
  ) { }

  toggleMenu():void {
    this.isMenuOpen = !this.isMenuOpen;
    const burger = document.querySelector(".button-burger");
    const menu = document.getElementById('sidebar');

    if (menu?.classList.contains('hidden')) {
      menu.classList.remove('hidden');
      burger?.classList.add('close');

    } else {
      menu?.classList.add('hidden');
      burger?.classList.remove('close');
    }
  }

  navigateToHome():void {
    this.router.navigate(['/']);
    console.log('Navigating to home');
  }

}