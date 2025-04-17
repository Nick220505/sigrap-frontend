import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import {
  Customer,
  CustomerService,
  Representative,
} from '../../services/customer.service';
import { Product, ProductService } from '../../services/product.service';

type ExpandedRows = Record<string, boolean>;

interface Status {
  label: string;
  value: string;
}

interface RowGroupMetaData {
  index: number;
  size: number;
}

@Component({
  selector: 'app-table-demo',
  imports: [
    TableModule,
    MultiSelectModule,
    SelectModule,
    InputIconModule,
    TagModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    ToggleButtonModule,
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    RatingModule,
    RippleModule,
    IconFieldModule,
  ],
  templateUrl: './table-demo.component.html',
  styleUrl: './table-demo.component.css',
})
export class TableDemoComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(ProductService);

  customers1: Customer[] = [];

  customers2: Customer[] = [];

  customers3: Customer[] = [];

  selectedCustomers1: Customer[] = [];

  selectedCustomer: Customer = {};

  representatives: Representative[] = [];

  statuses: Status[] = [];

  products: Product[] = [];

  rowGroupMetadata: Record<string, RowGroupMetaData> = {};

  expandedRows: ExpandedRows = {};

  activityValues: number[] = [0, 100];

  isExpanded = false;

  balanceFrozen = false;

  loading = true;

  readonly filter = viewChild.required<ElementRef>('filter');

  ngOnInit() {
    this.customerService.getCustomersLarge().then((customers) => {
      this.customers1 = customers;
      this.loading = false;

      this.customers1.forEach((customer) => {
        if (customer.date) {
          customer.date = new Date(customer.date);
        }
      });
    });
    this.customerService
      .getCustomersMedium()
      .then((customers) => (this.customers2 = customers));
    this.customerService
      .getCustomersLarge()
      .then((customers) => (this.customers3 = customers));
    this.productService
      .getProductsWithOrdersSmall()
      .then((data) => (this.products = data));

    this.representatives = [
      { name: 'Amy Elsner', image: 'amyelsner.png' },
      { name: 'Anna Fali', image: 'annafali.png' },
      { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
      { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
      { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
      { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
      { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
      { name: 'Onyama Limba', image: 'onyamalimba.png' },
      { name: 'Stephen Shaw', image: 'stephenshaw.png' },
      { name: 'XuXue Feng', image: 'xuxuefeng.png' },
    ];

    this.statuses = [
      { label: 'Unqualified', value: 'unqualified' },
      { label: 'Qualified', value: 'qualified' },
      { label: 'New', value: 'new' },
      { label: 'Negotiation', value: 'negotiation' },
      { label: 'Renewal', value: 'renewal' },
      { label: 'Proposal', value: 'proposal' },
    ];
  }

  onSort() {
    this.updateRowGroupMetaData();
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};

    if (this.customers3) {
      for (let i = 0; i < this.customers3.length; i++) {
        const rowData = this.customers3[i];
        const representativeName = rowData?.representative?.name ?? '';

        if (i === 0) {
          this.rowGroupMetadata[representativeName] = {
            index: 0,
            size: 1,
          };
        } else {
          const previousRowData = this.customers3[i - 1];
          const previousRowGroup = previousRowData?.representative?.name;
          if (representativeName === previousRowGroup) {
            this.rowGroupMetadata[representativeName].size++;
          } else {
            this.rowGroupMetadata[representativeName] = {
              index: i,
              size: 1,
            };
          }
        }
      }
    }
  }

  expandAll() {
    if (!this.isExpanded) {
      this.products.forEach((product) => {
        if (product.name) {
          this.expandedRows[product.name] = true;
        }
      });
    } else {
      this.expandedRows = {};
    }
    this.isExpanded = !this.isExpanded;
  }

  formatCurrency(value: number) {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter().nativeElement.value = '';
  }

  getSeverity(status: string) {
    switch (status) {
      case 'qualified':
      case 'instock':
      case 'INSTOCK':
      case 'DELIVERED':
      case 'delivered':
        return 'success';

      case 'negotiation':
      case 'lowstock':
      case 'LOWSTOCK':
      case 'PENDING':
      case 'pending':
        return 'warn';

      case 'unqualified':
      case 'outofstock':
      case 'OUTOFSTOCK':
      case 'CANCELLED':
      case 'cancelled':
        return 'danger';

      default:
        return 'info';
    }
  }

  calculateCustomerTotal(name: string) {
    let total = 0;

    if (this.customers2) {
      for (const customer of this.customers2) {
        if (customer.representative?.name === name) {
          total++;
        }
      }
    }

    return total;
  }
}
