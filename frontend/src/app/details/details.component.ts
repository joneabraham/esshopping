import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Productservice } from '../service/products.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit{
  productid:any;
  product:any;
  display:boolean=false;
  token:any;
  newp:any;
  products:any;
  showwishlist:any;
  msg:string="";
  tab:string='details';
    constructor(private router:Router, private activatedroute:ActivatedRoute, private service:Productservice, private http:HttpClient) { }

    checkwishlist(){
      const requestBody = { id: this.productid };
      this.http.post('http://localhost:3000/checkwishlist', requestBody )
      .subscribe((res:any)=>{
        console.log(res)
        if(res.message=='a'){
          this.showwishlist=false
        }
        else{
          this.showwishlist=true
        }

      },(err:any)=>{
        console.log("error occured", err)
      })
    }
    
    getProduct(){
      this.productid=this.activatedroute.snapshot.paramMap.get('id');

      this.http.get('http://localhost:3000/getproductsfromadmin')
      .subscribe((res:any)=>{
        this.products=res;
        this.product=this.products.filter((x:any)=> x.Product_Id==this.productid.toString())
        console.log("products from db", this.products)
        console.log("finded",this.product)
        this.newp=this.product[0];


      }, (err:any)=>{
        console.log("error from server", err)
      })
    }

    ngOnInit(): void {
      this.activatedroute.paramMap.subscribe(() => {
        this.tab = 'details';
        this.getProduct();
        this.checkwishlist();
      });
    }

    get similar(): any[] {
      if (!this.products || !this.newp) { return []; }
      const others = this.products.filter((x: any) => x.Product_Id != this.newp.Product_Id);
      const sameCategory = others.filter((x: any) => x.Product_Category === this.newp.Product_Category);
      const rest = others.filter((x: any) => x.Product_Category !== this.newp.Product_Category);
      return [...sameCategory, ...rest].slice(0, 4);
    }

    open(id: any) {
      this.router.navigate(['login', 'products', 'details', id]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    clicked(){
      this.display=false;
    } 
    wishlist(id:any) {
     

      this.token=localStorage.getItem('token');
      console.log("wishlist button clicked");
      this.display = true;
      const wishlist = {
        product_name: this.newp.Product_Name,
        product_available: this.newp.Product_Quantity>0? 'Available':'Not Available',
        product_price: this.newp.Product_Price,
        product_image: this.newp.Product_Image,
        product_id: this.newp.Product_Id
      };
      const headers = {
        'Authorization': 'Bearer ' + this.token
      };
      this.http.post('http://localhost:3000/create_wishlist', wishlist,{headers}).subscribe((res: any) => {
        console.log("product added successfully");
        console.log(res);
        // this.msg = res.message;
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: res.message,
          showConfirmButton: false,
          timer: 1500
        })
        this.checkwishlist();
      }, (error: any) => {
        console.log("error occurred");
        console.log(error);
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.error.message,
          showConfirmButton: false,
          timer: 1500
        })
      });
      console.log("added to wishlist");
    }

    addCart(){
      const cart={product_id:this.newp.Product_Id}
      this.http.post('http://localhost:3000/addToCart', cart )
      .subscribe((res:any)=>{
        console.log("added to cart");
        console.log(res);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: res.message,
          showConfirmButton: false,
          timer: 1500
        })
      },(error:any)=>{
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.error.message,
          showConfirmButton: false,
          timer: 1500
        })
        console.log("error occurred");  
      })}
  }
