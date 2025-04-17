import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { Product, ProductService } from '../../services/product.service';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-list-demo',
  imports: [
    CommonModule,
    DataViewModule,
    FormsModule,
    SelectButtonModule,
    PickListModule,
    OrderListModule,
    TagModule,
    ButtonModule,
  ],
  templateUrl: './list-demo.component.html',
  styleUrl: './list-demo.component.css',
})
export class ListDemoComponent implements OnInit {
  private readonly productService = inject(ProductService);

  layout: 'list' | 'grid' = 'list';

  options: string[] = ['list', 'grid'];

  products: Product[] = [];

  sourceCities: City[] = [];

  targetCities: City[] = [];

  orderCities: City[] = [];

  ngOnInit() {
    this.productService
      .getProductsSmall()
      .then((data) => (this.products = data.slice(0, 6)));

    this.sourceCities = [
      { name: 'San Francisco', code: 'SF' },
      { name: 'London', code: 'LDN' },
      { name: 'Paris', code: 'PRS' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Berlin', code: 'BRL' },
      { name: 'Barcelona', code: 'BRC' },
      { name: 'Rome', code: 'RM' },
    ];

    this.targetCities = [];

    this.orderCities = [
      { name: 'San Francisco', code: 'SF' },
      { name: 'London', code: 'LDN' },
      { name: 'Paris', code: 'PRS' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Berlin', code: 'BRL' },
      { name: 'Barcelona', code: 'BRC' },
      { name: 'Rome', code: 'RM' },
    ];
  }

  getSeverity(
    product: Product,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (product.inventoryStatus) {
      case 'INSTOCK':
        return 'success';

      case 'LOWSTOCK':
        return 'warn';

      case 'OUTOFSTOCK':
        return 'danger';

      default:
        return 'info';
    }
  }
}
