import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface CartLine {
  Product_Id: string;
  Product_Name: string;
  Product_Image: string;
  Product_Price: number;
  stock: number;
  qty: number;
}

const SHIPPING = 50;

@Component({
  selector: 'app-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit {
  items: CartLine[] = [];
  loading = true;
  empty = false;
  readonly shipping = SHIPPING;

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.getCartProducts();
  }

  get itemCount(): number {
    return this.items.reduce((n, i) => n + i.qty, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, i) => sum + i.Product_Price * i.qty, 0);
  }

  get total(): number {
    return this.subtotal + SHIPPING;
  }

  getCartProducts() {
    this.http.get('http://localhost:3000/getCart').subscribe({
      next: (cart: any) => {
        const cartItems: any[] = Object.values(cart || {});
        this.http.get('http://localhost:3000/getproductsfromadmin').subscribe({
          next: (all: any) => {
            const products: any[] = all || [];
            this.items = cartItems
              .map(c => {
                const p = products.find(x => String(x.Product_Id) === String(c.product_id));
                if (!p) { return null; }
                const stock = Number(p.Product_Quantity) || 0;
                return {
                  Product_Id: p.Product_Id,
                  Product_Name: p.Product_Name,
                  Product_Image: p.Product_Image,
                  Product_Price: Number(p.Product_Price) || 0,
                  stock,
                  qty: Math.max(1, Number(c.quantity) || 1)
                } as CartLine;
              })
              .filter((x): x is CartLine => !!x);
            this.empty = this.items.length === 0;
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: (err: any) => {
        console.log('error loading cart', err);
        this.loading = false;
      }
    });
  }

  increase(item: CartLine) {
    if (item.qty >= item.stock) {
      this.toast('info', `Only ${item.stock} in stock`);
      return;
    }
    this.setQuantity(item, item.qty + 1);
  }

  decrease(item: CartLine) {
    if (item.qty <= 1) { return; }
    this.setQuantity(item, item.qty - 1);
  }

  onQuantityTyped(item: CartLine, value: any) {
    const n = parseInt(value, 10);
    if (!Number.isInteger(n) || n < 1) { this.setQuantity(item, 1); return; }
    this.setQuantity(item, Math.min(n, item.stock));
  }

  private setQuantity(item: CartLine, qty: number) {
    const previous = item.qty;
    item.qty = qty; // optimistic
    this.http.put('http://localhost:3000/updateCart', { product_id: item.Product_Id, quantity: qty }).subscribe({
      error: (err: any) => {
        item.qty = err?.error?.quantity ?? previous;
        this.toast('error', err?.error?.message || "Couldn't update the quantity");
      }
    });
  }

  remove(id: string) {
    Swal.fire({
      title: 'Remove this item from your cart?',
      showCancelButton: true,
      confirmButtonText: 'Remove',
    }).then(result => {
      if (!result.isConfirmed) { return; }
      this.http.delete('http://localhost:3000/removeCart/' + id).subscribe({
        next: (res: any) => {
          this.items = this.items.filter(i => i.Product_Id !== id);
          this.empty = this.items.length === 0;
          this.toast('success', res.message);
        },
        error: (err: any) => this.toast('error', err?.error?.message || "Couldn't remove the item")
      });
    });
  }

  checkout() {
    const overStock = this.items.find(i => i.qty > i.stock);
    if (overStock) {
      this.toast('error', `${overStock.Product_Name}: only ${overStock.stock} in stock`);
      return;
    }
    const amount = this.total;
    Swal.fire({
      title: 'Go to payment?',
      text: 'You will pay ₹' + amount.toLocaleString('en-IN') + ' through Razorpay.',
      showCancelButton: true,
      confirmButtonText: 'Continue to payment',
    }).then(result => {
      if (!result.isConfirmed) { return; }
      const products = JSON.stringify(this.items.map(i => ({ productId: i.Product_Id, count: i.qty })));
      const id = this.route.snapshot.paramMap.get('id');
      const path = id ? ['login', 'products', 'buy', id, 'checkout'] : ['login', 'cart', 'checkout'];
      this.router.navigate(path, { queryParams: { amount, products } });
    });
  }

  private toast(icon: 'success' | 'error' | 'info', title: string) {
    Swal.fire({ position: 'top-end', icon, title, showConfirmButton: false, timer: 1500 });
  }
}
