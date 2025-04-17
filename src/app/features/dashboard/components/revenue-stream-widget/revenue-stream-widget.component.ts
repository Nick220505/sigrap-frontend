import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../../core/layout/services/layout.service';

interface ChartDataset {
  type: string;
  label: string;
  backgroundColor: string;
  data: number[];
  barThickness?: number;
  borderRadius?: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  borderSkipped?: boolean;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartOptions {
  maintainAspectRatio: boolean;
  aspectRatio: number;
  plugins: {
    legend: {
      labels: {
        color: string;
      };
    };
  };
  scales: {
    x: {
      stacked: boolean;
      ticks: {
        color: string;
      };
      grid: {
        color: string;
        borderColor: string;
      };
    };
    y: {
      stacked: boolean;
      ticks: {
        color: string;
      };
      grid: {
        color: string;
        borderColor: string;
        drawTicks: boolean;
      };
    };
  };
}

@Component({
  selector: 'app-revenue-stream-widget',
  imports: [ChartModule],
  templateUrl: './revenue-stream-widget.component.html',
  styleUrl: './revenue-stream-widget.component.css',
})
export class RevenueStreamWidgetComponent implements OnInit, OnDestroy {
  layoutService = inject(LayoutService);

  chartData!: ChartData;

  chartOptions!: ChartOptions;

  subscription!: Subscription;

  constructor() {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        this.initChart();
      });
  }

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor =
      documentStyle.getPropertyValue('--text-color') || '#495057';
    const borderColor = documentStyle.getPropertyValue('--surface-border');

    const isDarkMode = this.layoutService.isDarkTheme();

    const chartTextColor = isDarkMode ? '#ffffff' : textColor;
    const chartSecondaryTextColor = isDarkMode
      ? '#cccccc'
      : documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';

    this.chartData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          type: 'bar',
          label: 'Subscriptions',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
          data: [4000, 10000, 15000, 4000],
          barThickness: 32,
        },
        {
          type: 'bar',
          label: 'Advertising',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
          data: [2100, 8400, 2400, 7500],
          barThickness: 32,
        },
        {
          type: 'bar',
          label: 'Affiliate',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
          data: [4100, 5200, 3400, 7400],
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0,
          },
          borderSkipped: false,
          barThickness: 32,
        },
      ],
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: chartTextColor,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: chartSecondaryTextColor,
          },
          grid: {
            color: 'transparent',
            borderColor: 'transparent',
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: chartSecondaryTextColor,
          },
          grid: {
            color: borderColor,
            borderColor: 'transparent',
            drawTicks: false,
          },
        },
      },
    };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
