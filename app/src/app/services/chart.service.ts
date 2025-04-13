import { Injectable } from '@angular/core';
import { Chart, Colors, registerables } from 'chart.js';
import { ChartStrategy } from './chart-strategy';
Chart.register(...registerables);

@Injectable({
  providedIn: 'root'
})

// context
export class ChartService {
  private strategy!: ChartStrategy;

  setStrategy(strategy: ChartStrategy) {
    this.strategy = strategy;
  }

  renderChart(context: string, labels: any, data: any, title: string, key: string, secondaryKey?: string, thirdKey?: string) {
    if (this.strategy) {
      this.strategy.render(this, context, labels, data, title, key, secondaryKey, thirdKey);
    } else {
      throw new Error('Chart strategy not set');
    }
  }

  // context 

  single(graphTitle: string, key: string, labels: any, data: any, context: string, chartType: any) {
    let chart = new Chart(context, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: key,
            backgroundColor: [
              '#FFD700'
            ],
            borderColor: [
              'rgb(243, 184, 19)'
            ],
            data: data,
          }
        ]
      },
      options: {
        // responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            position: 'top',
            labels: {
              color: 'rgb(188, 174, 174)' // Colore delle etichette della legenda
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(188, 174, 174, 0.6)' // Colore della griglia dell'asse x
            },
            ticks: {
              color: 'rgba(188, 174, 174, 0.6)' // Colore delle etichette dell'asse x
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(188, 174, 174, 0.6)' // Colore della griglia dell'asse y
            },
            ticks: {
              color: 'rgba(188, 174, 174, 0.6)' // Colore delle etichette dell'asse y
            }
          }
        }
      }
    });
  }

  double(graphTitle: string, primaryDatasetKey: string, secondaryDatasetKey: string, labels: any, primaryDataset: any, secondaryDataset: any, context: string, chartType: any) {
    let chart = new Chart(context, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: primaryDatasetKey,
            backgroundColor: [
              'rgba(73, 221, 76, 0.6)',
            ],
            data: primaryDataset,
          },
          {
            label: secondaryDatasetKey,
            backgroundColor: [
              'rgba(205, 93, 93, 0.6)',
            ],
            data: secondaryDataset,
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: false
          },
          legend: {
            position: 'top',
            labels: {
              color: 'rgb(188, 174, 174)'
            },
            margin: 20 // Spazio tra la legenda e il grafico
          }
        },
        // responsive: true,
        // maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: 'rgba(188, 174, 174, 0.6)' // Colore della griglia dell'asse x
            },
            ticks: {
              color: 'rgba(188, 174, 174, 0.6)' // Colore delle etichette dell'asse x
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(188, 174, 174, 0.6)' // Colore della griglia dell'asse y
            },
            ticks: {
              color: 'rgba(188, 174, 174, 0.6)' // Colore delle etichette dell'asse y
            }
          }
        }
      }
    });
  }

  pieChartData(graphTitle: string, key: string, labels: any, data: any, context: string, chartType: any) {
    let chart = new Chart(context, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: key,
            backgroundColor: [
              'rgba(73, 221, 76, 0.6)',
              'rgba(205, 93, 93, 0.6)',  
              'rgba(208, 196, 196, 0.6)',
            ],
            borderWidth: 0,
            data: data,
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgb(188, 174, 174)',
            },
          },
          title: {
            display: false,
          }
        }
      },
    });
  }
}