import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/services/layout.service';

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
  tension?: number;
  hoverBackgroundColor?: string[];
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointHoverBackgroundColor?: string;
  pointHoverBorderColor?: string;
}

interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

interface ChartScaleTicks {
  color: string;
  font?: {
    weight: number;
  };
  display?: boolean;
}

interface ChartScaleGrid {
  color?: string;
  display?: boolean;
  drawBorder?: boolean;
}

interface ChartScale {
  ticks?: ChartScaleTicks;
  grid?: ChartScaleGrid;
  pointLabels?: {
    color: string;
  };
}

interface ChartOptions {
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
  plugins: {
    legend: {
      labels: {
        color: string;
        usePointStyle?: boolean;
      };
    };
  };
  scales?: Partial<{
    x: ChartScale;
    y: ChartScale;
    r: ChartScale;
  }>;
}

@Component({
  selector: 'app-chart-demo',
  imports: [ChartModule, FluidModule],
  templateUrl: './chart-demo.component.html',
  styleUrl: './chart-demo.component.css',
})
export class ChartDemoComponent implements OnInit, OnDestroy {
  private readonly layoutService = inject(LayoutService);

  lineData!: ChartData;

  barData!: ChartData;

  pieData!: ChartData;

  polarData!: ChartData;

  radarData!: ChartData;

  lineOptions!: ChartOptions;

  barOptions!: ChartOptions;

  pieOptions!: ChartOptions;

  polarOptions!: ChartOptions;

  radarOptions!: ChartOptions;

  subscription: Subscription;
  constructor() {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        this.initCharts();
      });
  }

  ngOnInit() {
    this.initCharts();
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor =
      documentStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary =
      documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const isDarkMode = this.layoutService.isDarkTheme();

    const chartTextColor = isDarkMode ? '#ffffff' : textColor;
    const chartSecondaryTextColor = isDarkMode ? '#cccccc' : textColorSecondary;

    this.barData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
          borderColor: documentStyle.getPropertyValue('--p-primary-500'),
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: 'My Second dataset',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
          borderColor: documentStyle.getPropertyValue('--p-primary-200'),
          data: [28, 48, 40, 19, 86, 27, 90],
        },
      ],
    };

    this.barOptions = {
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
          ticks: {
            color: chartSecondaryTextColor,
            font: {
              weight: 500,
            },
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: chartSecondaryTextColor,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };

    this.pieData = {
      labels: ['A', 'B', 'C'],
      datasets: [
        {
          data: [540, 325, 702],
          backgroundColor: [
            documentStyle.getPropertyValue('--p-indigo-500'),
            documentStyle.getPropertyValue('--p-purple-500'),
            documentStyle.getPropertyValue('--p-teal-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--p-indigo-400'),
            documentStyle.getPropertyValue('--p-purple-400'),
            documentStyle.getPropertyValue('--p-teal-400'),
          ],
        },
      ],
    };

    this.pieOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: chartTextColor,
          },
        },
      },
    };

    this.lineData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
          borderColor: documentStyle.getPropertyValue('--p-primary-500'),
          tension: 0.4,
        },
        {
          label: 'Second Dataset',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
          borderColor: documentStyle.getPropertyValue('--p-primary-200'),
          tension: 0.4,
        },
      ],
    };

    this.lineOptions = {
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
          ticks: {
            color: chartSecondaryTextColor,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: chartSecondaryTextColor,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };

    this.polarData = {
      datasets: [
        {
          data: [11, 16, 7, 3],
          backgroundColor: [
            documentStyle.getPropertyValue('--p-indigo-500'),
            documentStyle.getPropertyValue('--p-purple-500'),
            documentStyle.getPropertyValue('--p-teal-500'),
            documentStyle.getPropertyValue('--p-orange-500'),
          ],
          label: 'My dataset',
        },
      ],
      labels: ['Indigo', 'Purple', 'Teal', 'Orange'],
    };

    this.polarOptions = {
      plugins: {
        legend: {
          labels: {
            color: chartTextColor,
          },
        },
      },
      scales: {
        r: {
          grid: {
            color: surfaceBorder,
          },
          ticks: {
            display: false,
            color: chartSecondaryTextColor,
          },
        },
      },
    };

    this.radarData = {
      labels: [
        'Eating',
        'Drinking',
        'Sleeping',
        'Designing',
        'Coding',
        'Cycling',
        'Running',
      ],
      datasets: [
        {
          label: 'My First dataset',
          borderColor: documentStyle.getPropertyValue('--p-indigo-400'),
          pointBackgroundColor:
            documentStyle.getPropertyValue('--p-indigo-400'),
          pointBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
          pointHoverBackgroundColor: textColor,
          pointHoverBorderColor:
            documentStyle.getPropertyValue('--p-indigo-400'),
          data: [65, 59, 90, 81, 56, 55, 40],
        },
        {
          label: 'My Second dataset',
          borderColor: documentStyle.getPropertyValue('--p-purple-400'),
          pointBackgroundColor:
            documentStyle.getPropertyValue('--p-purple-400'),
          pointBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
          pointHoverBackgroundColor: textColor,
          pointHoverBorderColor:
            documentStyle.getPropertyValue('--p-purple-400'),
          data: [28, 48, 40, 19, 96, 27, 100],
        },
      ],
    };

    this.radarOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        r: {
          pointLabels: {
            color: textColor,
          },
          grid: {
            color: surfaceBorder,
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
