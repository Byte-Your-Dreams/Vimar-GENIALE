import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigatorComponent } from './navigator.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { fakeAsync, tick } from '@angular/core/testing';


describe('NavigatorComponent', () => {
  let component: NavigatorComponent;
  let fixture: ComponentFixture<NavigatorComponent>;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule,NavigatorComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleMenu', () => {
    it('should toggle isMenuOpen state', () => {
      expect(component.isMenuOpen).toBeFalse();
      component.toggleMenu();
      expect(component.isMenuOpen).toBeTrue();
      component.toggleMenu();
      expect(component.isMenuOpen).toBeFalse();
    });

    it('should add/remove CSS classes for menu and burger button', fakeAsync(() => {
      const menu = document.createElement('div');
      menu.id = 'sidebar';
      menu.classList.add('hidden');
      document.body.appendChild(menu);
    
      const burger = document.createElement('div');
      burger.classList.add('button-burger');
      document.body.appendChild(burger);

      fixture.detectChanges();
      tick();
    
      component.toggleMenu();
      tick();
      fixture.detectChanges();
    
      expect(menu.classList.contains('hidden')).toBeFalse();
      component.toggleMenu();
      tick();
      fixture.detectChanges();
      expect(menu.classList.contains('hidden')).toBeTrue();
    
      document.body.removeChild(menu);
      document.body.removeChild(burger);
    }));
  });

  describe('navigateToHome', () => {
    it('should navigate to home route', () => {
      component.navigateToHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});