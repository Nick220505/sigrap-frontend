import { Pipe, PipeTransform } from '@angular/core';
import { PurchaseOrderInfo } from '@features/supplier/models/purchase-order.model';

@Pipe({
  name: 'filterOrdersBySupplier',
})
export class FilterOrdersBySupplierPipe implements PipeTransform {
  transform(
    orders: PurchaseOrderInfo[] | null,
    supplierId: number | string | null | undefined,
  ): PurchaseOrderInfo[] {
    if (!orders || supplierId === null || supplierId === undefined) {
      return [];
    }

    const numericSupplierId =
      typeof supplierId === 'string' ? parseInt(supplierId, 10) : supplierId;

    if (isNaN(numericSupplierId)) {
      return [];
    }

    return orders.filter(
      (order) => order.supplier && order.supplier.id === numericSupplierId,
    );
  }
}
