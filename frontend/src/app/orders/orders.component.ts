import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Productservice } from '../service/products.service';
import { UsernameService } from '../service/username.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
   pr:any;
   newproducts:any;
   newp:any;
   username:any;
   mapproducts:any;
   updatedProd:any;
   showimg:boolean=false;
   selectedOrder: any = null;
   show:boolean=false;
   constructor(private http:HttpClient, private service:Productservice, private user:UsernameService){}

   clicked(item:any){
    this.selectedOrder = item;
   }
   close(){
    this.selectedOrder = null;
   }
   ngOnInit(): void {
   
    this.username=this.user.getUserName();
     this.http.get('http://localhost:3000/getAllOrderedProducts')
     .subscribe({
       next: (res: any) => {
         const orders: any[] = Object.values(res || {});
         // Newer orders store {name, price, image, count}; older ones used {Name, Price, Thumbnail}.
         this.newp = orders.map((order: any) => ({
           ...order,
           products: (order.products || []).map((p: any) => ({
             name: p.name ?? p.Name ?? 'Product',
             price: Number(p.price ?? p.Price) || 0,
             image: p.image ?? p.Thumbnail ?? '',
             count: Number(p.count) || 1
           }))
         })).reverse();
         this.showimg = this.newp.length === 0;
       },
       error: (err: any) => {
         console.log('error in getting orders', err);
       }
     });
   }
}
