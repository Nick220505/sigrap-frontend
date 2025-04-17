import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Product, ProductService } from '../../services/product.service';

interface Image {
  source: string;
  thumbnail: string;
  title: string;
}

@Component({
  selector: 'app-overlay-demo',
  imports: [
    ToastModule,
    DialogModule,
    ButtonModule,
    DrawerModule,
    PopoverModule,
    ConfirmPopupModule,
    InputTextModule,
    FormsModule,
    TooltipModule,
    TableModule,
    ToastModule,
  ],
  templateUrl: './overlay-demo.component.html',
  styleUrl: './overlay-demo.component.css',
})
export class OverlayDemoComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  images: Image[] = [];

  display = false;

  products: Product[] = [];

  visibleLeft = false;

  visibleRight = false;

  visibleTop = false;

  visibleBottom = false;

  visibleFull = false;

  displayConfirmation = false;

  selectedProduct!: Product;

  ngOnInit() {
    this.productService
      .getProductsSmall()
      .then((products) => (this.products = products));

    this.images = [];
    this.images.push({
      source: 'assets/demo/images/sopranos/sopranos1.jpg',
      thumbnail: 'assets/demo/images/sopranos/sopranos1_small.jpg',
      title: 'Sopranos 1',
    });
    this.images.push({
      source: 'assets/demo/images/sopranos/sopranos2.jpg',
      thumbnail: 'assets/demo/images/sopranos/sopranos2_small.jpg',
      title: 'Sopranos 2',
    });
    this.images.push({
      source: 'assets/demo/images/sopranos/sopranos3.jpg',
      thumbnail: 'assets/demo/images/sopranos/sopranos3_small.jpg',
      title: 'Sopranos 3',
    });
    this.images.push({
      source: 'assets/demo/images/sopranos/sopranos4.jpg',
      thumbnail: 'assets/demo/images/sopranos/sopranos4_small.jpg',
      title: 'Sopranos 4',
    });
  }

  confirm(event: Event) {
    this.confirmationService.confirm({
      key: 'confirm2',
      target: event.target || new EventTarget(),
      message: 'Are you sure that you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'You have accepted',
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
        });
      },
    });
  }

  open() {
    this.display = true;
  }

  close() {
    this.display = false;
  }

  toggleDataTable(op: Popover, event: Event) {
    op.toggle(event);
  }

  onProductSelect(op: Popover, event: TableRowSelectEvent<Product>) {
    op.hide();
    if (event.data && 'name' in event.data) {
      this.messageService.add({
        severity: 'info',
        summary: 'Product Selected',
        detail: event.data.name ?? 'Unnamed Product',
        life: 3000,
      });
    }
  }

  openConfirmation() {
    this.displayConfirmation = true;
  }

  closeConfirmation() {
    this.displayConfirmation = false;
  }
}
