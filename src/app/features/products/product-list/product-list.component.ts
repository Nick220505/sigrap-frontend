import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Product, ProductService } from '../services/product.service';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
  ],
  template: `
    <p-toast />

    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          (onClick)="openNew()"
        />
        <p-button
          severity="secondary"
          label="Delete"
          icon="pi pi-trash"
          outlined
          (onClick)="deleteSelectedProducts()"
          [disabled]="!selectedProducts || !selectedProducts.length"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-upload"
          severity="secondary"
          (onClick)="exportCSV()"
        />
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="products()"
      [rows]="10"
      [columns]="cols"
      [paginator]="true"
      [globalFilterFields]="[
        'name',
        'country.name',
        'representative.name',
        'status',
      ]"
      [tableStyle]="{ 'min-width': '75rem' }"
      [(selection)]="selectedProducts"
      [rowHover]="true"
      dataKey="id"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      [showCurrentPageReport]="true"
      [rowsPerPageOptions]="[10, 20, 30]"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Manage Products</h5>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              (input)="onGlobalFilter(dt, $event)"
              placeholder="Search..."
            />
          </p-iconfield>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th scope="col" style="width: 3rem">
            <p-tableHeaderCheckbox />
          </th>
          <th scope="col" style="min-width: 16rem">Code</th>
          <th scope="col" pSortableColumn="name" style="min-width: 16rem">
            Name
            <p-sortIcon field="name" />
          </th>
          <th scope="col">Image</th>
          <th scope="col" pSortableColumn="price" style="min-width: 8rem">
            Price
            <p-sortIcon field="price" />
          </th>
          <th scope="col" pSortableColumn="category" style="min-width: 10rem">
            Category
            <p-sortIcon field="category" />
          </th>
          <th scope="col" pSortableColumn="rating" style="min-width: 12rem">
            Reviews
            <p-sortIcon field="rating" />
          </th>
          <th
            scope="col"
            pSortableColumn="inventoryStatus"
            style="min-width: 12rem"
          >
            Status
            <p-sortIcon field="inventoryStatus" />
          </th>
          <th scope="col" style="min-width: 12rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-product>
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="product" />
          </td>
          <td style="min-width: 12rem">{{ product.code }}</td>
          <td style="min-width: 16rem">{{ product.name }}</td>
          <td>
            <img
              [src]="
                'https://primefaces.org/cdn/primeng/images/demo/product/' +
                product.image
              "
              [alt]="product.name"
              title="Product image"
              class="w-16 rounded-sm"
            />
          </td>
          <td>{{ product.price | currency: 'USD' }}</td>
          <td>{{ product.category }}</td>
          <td>
            <p-rating [(ngModel)]="product.rating" [readonly]="true" />
          </td>
          <td>
            <p-tag
              [value]="product.inventoryStatus"
              [severity]="getSeverity(product.inventoryStatus)"
            />
          </td>
          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              [rounded]="true"
              [outlined]="true"
              (click)="editProduct(product)"
              (keydown.enter)="editProduct(product)"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [outlined]="true"
              (click)="deleteProduct(product)"
              (keydown.enter)="deleteProduct(product)"
            />
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class ProductListComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly productService = inject(ProductService);
  private readonly confirmationService = inject(ConfirmationService);

  // Signal-based outputs
  editProductEvent = output<Product>();
  newProductEvent = output<void>();

  products = this.productService.getProducts();
  selectedProducts!: Product[] | null;
  cols!: Column[];
  exportColumns!: ExportColumn[];

  readonly dt = viewChild.required<Table>('dt');

  ngOnInit() {
    this.cols = [
      {
        field: 'code',
        header: 'Code',
        customExportHeader: 'Product Code',
      },
      { field: 'name', header: 'Name' },
      { field: 'image', header: 'Image' },
      { field: 'price', header: 'Price' },
      { field: 'category', header: 'Category' },
      { field: 'rating', header: 'Rating' },
      { field: 'inventoryStatus', header: 'Status' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
  }

  exportCSV() {
    this.dt().exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getSeverity(status: string) {
    switch (status) {
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

  openNew() {
    this.newProductEvent.emit();
  }

  editProduct(product: Product) {
    this.editProductEvent.emit(product);
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedProducts?.forEach((product) => {
          if (product.id) {
            this.productService.deleteProductById(product.id);
          }
        });
        this.selectedProducts = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Products Deleted',
          life: 3000,
        });
      },
    });
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (product.id) {
          this.productService.deleteProductById(product.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Product Deleted',
            life: 3000,
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Product ID not found',
            life: 3000,
          });
        }
      },
    });
  }
}
