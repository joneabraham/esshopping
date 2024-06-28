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
     .subscribe((res)=>{
      // console.log("response from server")
       this.pr=Object.values(res);
       
        this.updatedProd = this.pr.map((item:any) => {
        const filteredProducts = item.products.map((product:any) => {
          const matchedProduct = this.pr.find(
            (serviceProduct:any) => serviceProduct.Product_ID === product.productId
          );
      
          return matchedProduct || product;
        });
      
        return { ...item, products: filteredProducts };
      });
      console.log("updated products",this.updatedProd);  
      this.newp=this.updatedProd.reverse();      
      if(this.updatedProd.length===0){
        this.showimg=true;
        console.log("showimg",this.showimg);
      }
      //  this.newproducts=this.mapproducts.map((item:any)=>{
      //      return{...item, products: this.mapproducts }
      //  })
      //  console.log("new products",this.newproducts);
     },(err:any)=>{
      console.log(err);
      console.log("error in getting products")
     })
   }
}
