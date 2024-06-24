import { Component, DoCheck, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Productservice } from '../service/products.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ProductreduceService } from '../service/productreduce.service';
@Component({
  selector: 'app-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit, OnChanges {
  productid:any;
  productprice:number=0;
  product:any;
  msg:string="";
  token:any;
  cookieValue:any;
  no:number=1;
  length:any;
  display:boolean=false;
  products:any;
  filteredObjects:any=[];
  orderedproducts:any;
  empty:boolean=false;
  totalamount:number=0;
  aftership:any;
  newObject: any[] = [];
  constructor(private pro:ProductreduceService, private service:Productservice, private router:Router , private route:ActivatedRoute, private http:HttpClient) { }
  
  ngOnChanges(): void {
    this.calculateTotal();
  }
  
  checkout(amount:any){
    const id = this.route.snapshot.paramMap.get('id'); 
    confirm("Are you sure you want to checkout?");
    console.log("checkout button clicked")
    Swal.fire({
      title: 'Are you sure you want to Checkout?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    
    }).then((result) => {
      if (result.isConfirmed) {
    if(window.location.pathname=="/login/cart"){
       this.router.navigate(['login', 'cart' , 'checkout'],{
      queryParams: {
        amount: amount,
        products: JSON.stringify(this.newObject)
       }});
    }
    this.router.navigate(['login','products', 'buy',id, 'checkout'], {
      queryParams: {
        amount: amount,
        products: JSON.stringify(this.newObject)
      }
    });
  }}); 
  }
 
  decrement(item: any) {
    
    if (!item.itemcount) {
      item.itemcount = 1;
    } else {
      item.itemcount = parseInt(item.itemcount) + 1;
      this.calculateTotal();

    }
  }
  
  increment(item: any) {
    
    if (item.itemcount && item.itemcount > 0) {
      item.itemcount = parseInt(item.itemcount) - 1;
      this.calculateTotal();


    }
  }
   
 calculateTotal(){
  this.totalamount=0;
  for(let prod of this.filteredObjects){
    this.totalamount+=prod.Price*prod.itemcount;
    this.aftership=this.totalamount+50;
  }
 }

  getCartProducts(){
    this.http.get('http://localhost:3000/getCart').subscribe((res: any) => {

    console.log("products get from server");
    this.products = Object.values(res);
    this.length=this.products.length;
    console.log("products from server" , this.products)

    
    this.filteredObjects = this.service.product.filter((product: any) => {
      return this.products.every((newproduct:any) => {
        return product.Product_ID === parseInt(newproduct.product_id);
      });
    });
  this.products.forEach((product: any) => {
  const matchingProducts = this.service.product.filter((newproduct: any) => {
    return newproduct.Product_ID === parseInt(product.product_id);
  });
  this.filteredObjects.push(...matchingProducts);
});
console.log("filtered  products",this.filteredObjects);

interface Product {
  Product_ID: number;
  itemcount: number;
}

const tempObject: { [key: number]: boolean } = {};
const uniqueProducts: Product[] = [];

this.filteredObjects.forEach((item: Product) => {
  const productId = item.Product_ID;
  if (tempObject[productId]) {
    const existingProduct = uniqueProducts.find((p) => p.Product_ID === productId);
    if (existingProduct) {
      existingProduct.itemcount += 1; 
    }
  } else {
    tempObject[productId] = true;
    item.itemcount = 1; 
    uniqueProducts.push(item); 
  }
});

this.filteredObjects = uniqueProducts; 

 this.newObject = this.filteredObjects.map((item: Product) => {
  return {
    productId: item.Product_ID,
    count: item.itemcount
  };
});
console.log("new object", this.newObject); 



    this.orderedproducts=this.filteredObjects.map((obj:any)=> obj.Product_ID)
    console.log("ordered products", this.orderedproducts);

    if(this.length==0){
        this.empty=true;
    }
    this.calculateTotal();

    
  }, (error: any) => {
    console.log("error occurred");
    console.log(error);
  });

  }
 
  remove(id:number){
    
    Swal.fire({
      title: 'Are you sure you want to Remove product from cart?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    
    }).then((result) => {
      if (result.isConfirmed) {
    console.log("remove button clicked")
    this.http.delete('http://localhost:3000/removeCart/'+id).subscribe((res: any) => {
      console.log('product deleted from cart');
      console.log(res)
      
      this.getCartProducts();
      this.calculateTotal();
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: res.message,
        showConfirmButton: false,
        timer: 1500
      })
   } ,(error: any) => {
      console.log('error occured');
      console.log(error);
   });
      }});

  }



   ngOnInit(){

    // this.route.queryParams.subscribe((params) => {
    //   const userToken = params['userToken'];  
    //   console.log('User Token:', userToken);
    //   this.cookieValue = JSON.parse(userToken);
    //   console.log(this.cookieValue);
    // });
    // this.productid=this.activatedroute.snapshot.paramMap.get('id');
    // this.product=this.service.product.find(x=> x.Product_ID==this.productid)
    // this.products=this.service.product;
    // console.log(this.product)
   
   
    this.getCartProducts();
    
  }
clicked(){
  this.display=false;
}
  
 
}




