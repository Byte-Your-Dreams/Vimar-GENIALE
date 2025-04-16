import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scraper-button',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './scraper-button.component.html',
  styleUrl: './scraper-button.component.css'
})
export class ScraperButtonComponent implements OnDestroy {
  public isLoading: Boolean = false;
  private statusCheckInterval: Subscription | null = null;
  private jobId: string | null = null;

  constructor(private http: HttpClient) { }

  startScraper(): void {   
    this.isLoading = true;
    const payload = new HttpParams()
      .set('project', 'Vimar')
      .set('spider', 'SpiderVimar');
    const startingUrl = `${window.location.protocol}//${window.location.hostname}:6800/schedule.json`;
    
    this.http.post(startingUrl, payload.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    },).subscribe({
      next: (response: any) => {
        console.log('Scraper avviato con successo');
        if (response.jobid) {
          this.jobId = response.jobid;
        } this.startStatusCheck();
      },
      error: (error) => {
        console.error('Errore nell\'avvio dello scraper:', error);
        this.isLoading = false;
      }
    });
  }

  startStatusCheck(): void {
    if (!this.jobId) {
      console.error('Job ID non disponibile');
      return;
    }
    this.statusCheckInterval = interval(5*60*1000).subscribe(() => {
      this.checkScraperStatus();
    });
  }

  checkScraperStatus(): void {
    const params = new HttpParams()
      .set('project', 'Vimar')
      .set('spider', 'SpiderVimar')
      .set('job', this.jobId ?? '');
    const checkUrl = `${window.location.protocol}//${window.location.hostname}:6800/status.json`;
    
    this.http.get(checkUrl, { params }).subscribe({
      next: (response: any) => {
        console.log('Stato attuale dello scraper:', response.currstate);
        if (response.currstate === 'finished') {
          this.stopStatusCheck();
          console.log('Scraper completato');
        } else if (response.currstate === 'running') {
          console.log('Scraper ancora in esecuzione');
        }
      },
      error: (error) => {
        console.error('Errore nel controllo dello stato dello scraper:', error);
      },
    });
  }

  stopStatusCheck(): void {
    this.isLoading = false;
    if (this.statusCheckInterval) {
      this.statusCheckInterval.unsubscribe();
      this.statusCheckInterval = null;
    }
  }

  ngOnDestroy(): void {
    if (this.statusCheckInterval) {
      this.statusCheckInterval.unsubscribe();
    }
  }
}
