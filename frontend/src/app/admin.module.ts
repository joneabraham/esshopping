import { NgModule } from '@angular/core';
import { AdminloginComponent } from './adminlogin/adminlogin.component';
import { AdminhomeComponent } from './adminhome/adminhome.component';
import { AddproductComponent } from './addproduct/addproduct.component';
import { EditproductsComponent } from './editproducts/editproducts.component';
import { AdminpaymentComponent } from './adminpayment/adminpayment.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { ChartModule } from 'primeng/chart';
@NgModule({
  declarations: [
    AdminloginComponent,
    AdminhomeComponent,
    AddproductComponent,
    EditproductsComponent,
    AdminpaymentComponent,
  ],
  imports: [RouterModule, CommonModule, FormsModule, AdminRoutingModule, ChartModule],
})
export class AdminModule {}
