import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
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
import { TooltipModule } from 'primeng/tooltip';
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
    TooltipModule,
  ],
  template: `
    <p-toast />

    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          (onClick)="openNew()"
          pTooltip="Crear nuevo producto"
          tooltipPosition="top"
        />
        <p-button
          severity="secondary"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          (onClick)="deleteSelectedProducts()"
          [disabled]="!selectedProducts() || !selectedProducts()?.length"
          pTooltip="Eliminar productos seleccionados"
          tooltipPosition="top"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-upload"
          severity="secondary"
          (onClick)="exportCSV()"
          pTooltip="Exportar datos a CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="productService.products()"
      [rows]="10"
      [columns]="cols"
      [paginator]="true"
      [globalFilterFields]="['name', 'category', 'price', 'inventoryStatus']"
      [tableStyle]="{ 'min-width': '75rem' }"
      [(selection)]="selectedProducts"
      [rowHover]="true"
      dataKey="id"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
      [showCurrentPageReport]="true"
      [rowsPerPageOptions]="[10, 20, 30]"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Administrar Productos</h5>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              (input)="onGlobalFilter(dt, $event)"
              placeholder="Buscar..."
              class="pl-8"
            />
          </p-iconfield>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th scope="col" style="width: 3rem">
            <p-tableHeaderCheckbox />
          </th>
          <th scope="col" style="min-width: 8rem">Código</th>
          <th scope="col" pSortableColumn="name" style="min-width: 16rem">
            Nombre
            <p-sortIcon field="name" />
          </th>
          <th scope="col" style="min-width: 8rem">Imagen</th>
          <th scope="col" pSortableColumn="price" style="min-width: 8rem">
            Precio
            <p-sortIcon field="price" />
          </th>
          <th scope="col" pSortableColumn="category" style="min-width: 10rem">
            Categoría
            <p-sortIcon field="category" />
          </th>
          <th scope="col" pSortableColumn="rating" style="min-width: 8rem">
            Reseñas
            <p-sortIcon field="rating" />
          </th>
          <th
            scope="col"
            pSortableColumn="inventoryStatus"
            style="min-width: 10rem"
          >
            Estado
            <p-sortIcon field="inventoryStatus" />
          </th>
          <th scope="col" style="width: 8rem">Acciones</th>
        </tr>
      </ng-template>
      <ng-template #body let-product>
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="product" />
          </td>
          <td style="min-width: 8rem">{{ product.code }}</td>
          <td style="min-width: 16rem">{{ product.name }}</td>
          <td style="min-width: 8rem">
            <img
              [src]="
                'https://primefaces.org/cdn/primeng/images/demo/product/' +
                product.image
              "
              [alt]="product.name"
              title="Imagen del producto"
              class="w-16 rounded-sm shadow-sm"
            />
          </td>
          <td style="min-width: 8rem">
            {{ product.price | currency: 'USD' }}
          </td>
          <td style="min-width: 10rem">{{ product.category }}</td>
          <td style="min-width: 8rem">
            <p-rating [(ngModel)]="product.rating" [readonly]="true" />
          </td>
          <td style="min-width: 10rem">
            <p-tag
              [value]="product.inventoryStatus"
              [severity]="getSeverity(product.inventoryStatus)"
            />
          </td>
          <td style="width: 8rem">
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              [rounded]="true"
              [outlined]="true"
              (click)="editProduct(product)"
              (keydown.enter)="editProduct(product)"
              pTooltip="Editar"
              tooltipPosition="top"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [outlined]="true"
              (click)="deleteProduct(product)"
              (keydown.enter)="deleteProduct(product)"
              pTooltip="Eliminar"
              tooltipPosition="top"
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
  readonly productService = inject(ProductService);
  private readonly confirmationService = inject(ConfirmationService);

  editProductEvent = output<Product>();
  newProductEvent = output<void>();

  selectedProducts = signal<Product[] | null>(null);
  cols!: Column[];
  exportColumns!: ExportColumn[];

  readonly dt = viewChild.required<Table>('dt');

  ngOnInit() {
    this.cols = [
      {
        field: 'code',
        header: 'Código',
        customExportHeader: 'Código del Producto',
      },
      { field: 'name', header: 'Nombre' },
      { field: 'image', header: 'Imagen' },
      { field: 'price', header: 'Precio' },
      { field: 'category', header: 'Categoría' },
      { field: 'rating', header: 'Valoración' },
      { field: 'inventoryStatus', header: 'Estado' },
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

  getSeverity(
    status: string | undefined,
  ): 'success' | 'warn' | 'danger' | 'info' {
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
      message:
        '¿Estás seguro de que deseas eliminar los productos seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        const productsToDelete = this.selectedProducts();
        if (productsToDelete) {
          productsToDelete.forEach((product) => {
            if (product.id) {
              this.productService.deleteProductById(product.id).subscribe({
                error: (err) =>
                  this.showError('Error al eliminar producto', err.message),
              });
            }
          });
          this.selectedProducts.set(null);
          this.showSuccess('Éxito', 'Productos Eliminados');
        }
      },
    });
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar ' + product.name + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (product.id) {
          this.productService.deleteProductById(product.id).subscribe({
            next: () =>
              this.showSuccess('Éxito', 'Producto Eliminado ' + product.name),
            error: (err) =>
              this.showError('Error al eliminar producto', err.message),
          });
        } else {
          this.showError(
            'Error',
            'ID del producto no encontrado para ' + product.name,
          );
        }
      },
    });
  }

  private showSuccess(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }

  private showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }
}
