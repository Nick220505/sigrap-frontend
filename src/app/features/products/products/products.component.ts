import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
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

interface StatusItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-products',
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
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
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

    <p-dialog
      [(visible)]="productDialog"
      [style]="{ width: '450px' }"
      header="Product Details"
      [modal]="true"
    >
      <ng-template #content>
        <div class="flex flex-col gap-6">
          @if (product.image) {
            <img
              [src]="
                'https://primefaces.org/cdn/primeng/images/demo/product/' +
                product.image
              "
              [alt]="product.name"
              title="Product image"
              class="block pb-4 m-auto"
            />
          }
          <div>
            <label for="name" class="block mb-3 font-bold">Name</label>
            <input
              type="text"
              pInputText
              id="name"
              [(ngModel)]="product.name"
              required
              fluid
            />
            @if (submitted && !product.name) {
              <small class="text-red-500">Name is required.</small>
            }
          </div>
          <div>
            <label for="description" class="block mb-3 font-bold"
              >Description</label
            >
            <textarea
              id="description"
              pTextarea
              [(ngModel)]="product.description"
              required
              rows="3"
              cols="20"
              fluid
            ></textarea>
          </div>

          <div>
            <label for="inventoryStatus" class="block mb-3 font-bold"
              >Inventory Status</label
            >
            <p-select
              [(ngModel)]="product.inventoryStatus"
              inputId="inventoryStatus"
              [options]="statuses"
              optionLabel="label"
              optionValue="label"
              placeholder="Select a Status"
              fluid
            />
          </div>

          <div>
            <span class="block mb-4 font-bold">Category</span>
            <div class="grid grid-cols-12 gap-4">
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category1"
                  name="category"
                  value="Accessories"
                  [(ngModel)]="product.category"
                />
                <label for="category1">Accessories</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Clothing"
                  [(ngModel)]="product.category"
                />
                <label for="category2">Clothing</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electronics"
                  [(ngModel)]="product.category"
                />
                <label for="category3">Electronics</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category4"
                  name="category"
                  value="Fitness"
                  [(ngModel)]="product.category"
                />
                <label for="category4">Fitness</label>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label for="price" class="block mb-3 font-bold">Price</label>
              <p-inputnumber
                id="price"
                [(ngModel)]="product.price"
                mode="currency"
                currency="USD"
                locale="en-US"
                fluid
              />
            </div>
            <div class="col-span-6">
              <label for="quantity" class="block mb-3 font-bold"
                >Quantity</label
              >
              <p-inputnumber
                id="quantity"
                [(ngModel)]="product.quantity"
                fluid
              />
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="hideDialog()"
          (keydown.enter)="hideDialog()"
        />
        <p-button
          label="Save"
          icon="pi pi-check"
          (click)="saveProduct()"
          (keydown.enter)="saveProduct()"
        />
      </ng-template>
    </p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class ProductsComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly productService = inject(ProductService);
  private readonly confirmationService = inject(ConfirmationService);

  productDialog = false;

  products = signal<Product[]>([]);

  product!: Product;

  selectedProducts!: Product[] | null;

  submitted = false;

  statuses: StatusItem[] = [];

  readonly dt = viewChild.required<Table>('dt');

  exportColumns!: ExportColumn[];

  cols!: Column[];

  exportCSV() {
    this.dt().exportCSV();
  }

  ngOnInit() {
    this.loadDemoData();
  }

  loadDemoData() {
    this.productService.getProducts().then((data) => {
      this.products.set(data);
    });

    this.statuses = [
      { label: 'INSTOCK', value: 'instock' },
      { label: 'LOWSTOCK', value: 'lowstock' },
      { label: 'OUTOFSTOCK', value: 'outofstock' },
    ];

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
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  editProduct(product: Product) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products.set(
          this.products().filter(
            (val) => !this.selectedProducts?.includes(val),
          ),
        );
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

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products.set(
          this.products().filter((val) => val.id !== product.id),
        );
        this.product = {};
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Deleted',
          life: 3000,
        });
      },
    });
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.products().length; i++) {
      if (this.products()[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  createId(): string {
    let id = '';
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
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

  saveProduct() {
    this.submitted = true;
    const _products = this.products();
    if (this.product.name?.trim()) {
      if (this.product.id) {
        _products[this.findIndexById(this.product.id)] = this.product;
        this.products.set([..._products]);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Updated',
          life: 3000,
        });
      } else {
        this.product.id = this.createId();
        this.product.image = 'product-placeholder.svg';
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Created',
          life: 3000,
        });
        this.products.set([..._products, this.product]);
      }

      this.productDialog = false;
      this.product = {};
    }
  }
}
