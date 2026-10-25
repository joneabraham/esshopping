import { Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { NgForm } from '@angular/forms';
import { set } from 'mongoose';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import Swal  from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent  {
   name: string = '';
   email: string = '';
  password: string = '';
   npassword: string = '';
   msg:string='';
   display:boolean=false;
   ischecked:boolean=false;
   @ViewChild('check') check:any;

  constructor(private http: HttpClient, private toastr:ToastrService, private router:Router) {}

  ngOnInit(): void {}


  clicked (){
    this.display=false;
    console.log("clicked");
    console.log(this.display);  
  }

  onSubmit(form: NgForm) {
    
    if (form.valid) {
      
      console.log('Form submitted');
  
      // this.msg = 'User created successfully';

      if(this.name.length==0 || this.email.length==0 || this.password.length==0 ){
        this.msg='Fill in your name, email and password to continue.';
        this.display=true;
        return;
      }
  
      if (this.password !== this.npassword) {
        this.msg='The two passwords don’t match. Type the same password in both fields.';
        this.display=true;
        return;
      }
  
      if (this.password.length < 6) {
        this.msg='Use a password with at least 6 characters.';
        this.display=true;
        return;
      }
  
    }
    this.msg='';
    console.log('onSubmit method called');
    console.log('Name:', form.value.name);
    console.log('Email:', this.email);
    console.log('Form Value:', form.value);
    const user = { name: this.name, email: this.email, password:this.password };
    this.http.post('http://localhost:3000/create_user', user)
      .subscribe(
        (response: any) => {
          
          console.log('User created successfully');
          console.log('Response:', response);
          // localStorage.setItem('token', response.token);
          // this.toastr.success('User created successfully');
          Swal.fire({
            title: 'User created Successfully',
            text: 'Please login to continue ',
            icon: 'success',
            timer: 3000, 
            showConfirmButton: false 
          });
          this.router.navigate(['/login']);
        },
        (error: any) => {
          console.log('Error creating user');
          console.log('Error:', error);
          Swal.fire({
            title: 'Error occured',
            text: error.error.message ,
            icon: 'error',
            timer: 3000, 
            showConfirmButton: false 
          });
        }
      );
    form.reset();
    this.ischecked=false;
    this.check.nativeElement.checked=false;
  }
 
  
 
}


