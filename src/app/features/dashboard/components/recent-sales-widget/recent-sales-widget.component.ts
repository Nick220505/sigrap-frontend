import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import {
  Product,
  ProductService,
} from '../../../../pages/services/product.service';

@Component({
  selector: 'app-recent-sales-widget',
  imports: [CommonModule, TableModule, ButtonModule, RippleModule],
  templateUrl: './recent-sales-widget.component.html',
  styleUrl: './recent-sales-widget.component.css',
})
export class RecentSalesWidgetComponent implements OnInit {
  private readonly productService = inject(ProductService);

  products!: Product[];

  ngOnInit() {
    this.productService
      .getProductsSmall()
      .then((data) => (this.products = data));
  }
}
