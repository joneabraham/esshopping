import { HttpClient } from '@angular/common/http';
import { Component ,OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adminhome',
  templateUrl: './adminhome.component.html',
  styleUrls: ['./adminhome.component.css']
})
export class AdminhomeComponent implements OnInit {
  products:any[]=[];
  payment:any;
  search:string='';
  length:any;
  data: any;
  options: any;
  
constructor(private http:HttpClient, private router:Router, private toastr:ToastrService){

}
getProduct(){
  this.http.get('http://localhost:3000/admin/getproducts')
  .subscribe((res:any)=>{
    this.products=res.products
    this.length=res.length;
    // console.log("products" , res.product)
    let count=0
    this.payment= res.product.reduce((acc:any,item:any)=>{
      
      for(let pro of item.products){
         count+=pro.count
      }
      return count
    },0)
    console.log(this.products)
    const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      // this.apiService.getReturn(`${environment.BASE_API_URL}/project/${this.projectId}/billing-history`).subscribe((data)=>{
      //   this.billingHistories = data.reverse()
      const labels = this.products.map(product => product.Product_Name);
      const amounts = this.products.map(product => product.Product_Discount);
      
        const colors = this.generateColors(amounts.length);

        this.data = {  
          labels: labels,
          datasets: [
            {
              label: 'Discount',
              data: amounts,
              backgroundColor: colors.backgroundColors,
              borderColor: colors.borderColors,
              borderWidth: 1
            }
          ]
        };
      // });

      this.options = {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
  }, (err:any)=>{
    console.log("error from server", err)
  })
}
ngOnInit(): void {
  this.getProduct();
      
}

delete(id:any){
  console.log(id)
  confirm("Are you sure you want to delete the product")
  const productid=id;
  this.http.delete('http://localhost:3000/admin/removeproduct', {body:{productid}})
  .subscribe((res:any)=>{
    console.log(res)
    this.getProduct()
  }, (err:any)=>{
    console.log("error occured", err)
  })
}
logout(){
  Swal.fire({
    title: 'Are you sure you want to Logout?',
    showCancelButton: true,
    confirmButtonText: 'Yes',
  
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Logged out Successfully',
        text: 'Please login to continue',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        localStorage.removeItem('token')
        this.router.navigate(['admin','login']);
      });
    }
  });
}

edit(id:any){
  const Product_Id=id
  confirm("Are you sure you want to edit the product");
  this.router.navigate(['admin', 'login', 'home', 'editproducts'],
  {queryParams: {Product_Id} })
}

generateColors(count: number) {
  const backgroundColors = [];
  const borderColors = [];
  
  for (let i = 0; i < count; i++) {
    const color = this.getRandomColor();
    backgroundColors.push(color.backgroundColor);
    borderColors.push(color.borderColor);
  }
  
  return { backgroundColors, borderColors };
}

getRandomColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
  const borderColor = `rgba(${r}, ${g}, ${b}, 1)`;
  
  return { backgroundColor, borderColor };
}
}
