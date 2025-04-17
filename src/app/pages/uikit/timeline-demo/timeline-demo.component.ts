import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';

interface TimelineEvent {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
}

@Component({
  selector: 'app-timeline-demo',
  imports: [TimelineModule, ButtonModule, CardModule],
  templateUrl: './timeline-demo.component.html',
  styleUrl: './timeline-demo.component.css',
})
export class TimelineDemoComponent implements OnInit {
  events1: TimelineEvent[] = [];

  events2: string[] = [];

  ngOnInit() {
    this.events1 = [
      {
        status: 'Ordered',
        date: '15/10/2020 10:30',
        icon: 'pi pi-shopping-cart',
        color: '#9C27B0',
        image: 'game-controller.jpg',
      },
      {
        status: 'Processing',
        date: '15/10/2020 14:00',
        icon: 'pi pi-cog',
        color: '#673AB7',
      },
      {
        status: 'Shipped',
        date: '15/10/2020 16:15',
        icon: 'pi pi-envelope',
        color: '#FF9800',
      },
      {
        status: 'Delivered',
        date: '16/10/2020 10:00',
        icon: 'pi pi-check',
        color: '#607D8B',
      },
    ];

    this.events2 = ['2020', '2021', '2022', '2023'];
  }
}
