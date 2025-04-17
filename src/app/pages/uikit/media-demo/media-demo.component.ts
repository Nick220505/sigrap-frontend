import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { PhotoService } from '../../services/photo.service';
import { Product, ProductService } from '../../services/product.service';

interface ResponsiveOption {
  breakpoint: string;
  numVisible: number;
  numScroll: number;
}

interface Image {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'app-media-demo',
  imports: [
    CommonModule,
    CarouselModule,
    ButtonModule,
    GalleriaModule,
    ImageModule,
    TagModule,
  ],
  templateUrl: './media-demo.component.html',
  styleUrl: './media-demo.component.css',
})
export class MediaDemoComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly photoService = inject(PhotoService);

  products!: Product[];

  images!: Image[];

  galleriaResponsiveOptions: ResponsiveOption[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
      numScroll: 1,
    },
    {
      breakpoint: '960px',
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  carouselResponsiveOptions: ResponsiveOption[] = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  ngOnInit() {
    this.productService.getProductsSmall().then((products) => {
      this.products = products;
    });

    this.photoService.getImages().then((images) => {
      this.images = images;
    });
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
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
}
