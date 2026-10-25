import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  amount: any;
  paymentId: any;
  date: Date = new Date();
  lines: { name: string; price: number; count: number }[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.amount = params['amount'];
      this.paymentId = params['paymentId'];
      if (!this.paymentId) { return; }

      // Stock is reduced by the server when the payment is saved, so this page
      // only reads the order and is safe to reload.
      this.http.get(`http://localhost:3000/getOrderedProducts?paymentId=${encodeURIComponent(this.paymentId)}`)
        .subscribe({
          next: (order: any) => {
            if (order?.date) { this.date = new Date(order.date); }
            if (order?.amount) { this.amount = order.amount; }
            this.lines = (order?.products || []).map((p: any) => ({
              name: p.name ?? p.Name ?? 'Product',
              price: Number(p.price ?? p.Price) || 0,
              count: Number(p.count) || 1
            }));
          },
          error: (err: any) => console.log('error loading order', err)
        });
    });
  }
}
