import { HttpClient } from '@angular/common/http';
import { Component, DoCheck, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LoggedinService } from '../service/loggedin.service';
import { ToastrService } from 'ngx-toastr';
import { UsernameService } from '../service/username.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private name: UsernameService,
    private service: LoggedinService,
    private router: Router,
    private route: ActivatedRoute,
    private cookie: CookieService
  ) {}

  email: string = '';
  password: string = '';
  loader: boolean = false;
  username: string = '';
  logindisplay: boolean = false;

  clicked() {
    this.logindisplay = false;
  }

  sub() {
    setTimeout(() => {
      this.logindisplay = false;
    }, 2000);
  }

  sessiontime(cookie: any) {
    const sessionend = cookie.sessionEnd;
    const currentTime = new Date().getTime();
    const remainingTime = sessionend - currentTime;
    setTimeout(() => {
      this.service.logout();
      this.toastr.warning('Session ended, Please login to continue');
      this.router.navigate(['login']);
    }, remainingTime);
  }

  
  onsubmit(form: NgForm) {
    this.sub();

    console.log('onsubmit method called');
    console.log(form.value);

    const user = { email: this.email, password: this.password };
    if (this.email.length == 0 || this.password.length == 0) {
      this.toastr.warning('All fields are required');
      return;
    }

    this.http.post('http://localhost:3000/login', user).subscribe(
      {next:(response: any) => {
        console.log(response);

        this.username = response.name;

        console.log('USER NAME', this.username);
        this.name.setUserName(this.username);
        if (response.message == 'Authentication successful') {
          // this.toastr.success('Login successful');
          Swal.fire({
            title: 'Login Successful',
            text: 'Welcome back ' + this.name.getUserName(),
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
          });
        }
      
        localStorage.setItem('token', response.cookie.token);

        if (response) {
          console.log('Received cookie:', response.cookie);
          this.sessiontime(response.cookie);
          
            this.router.navigate(['products'], {
              relativeTo: this.route,
              // queryParams: { userToken: JSON.stringify(response.cookie) },
            });
         
        }
        form.reset();
      },
      error:(error: any) => {
        console.log('login failed');
        console.log(error);
        if (error.error && error.error.message) {
          Swal.fire({
            title: 'Error occured',
            text: error.error.message,
            icon: 'error',
            timer: 1000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: 'Error occured',
            icon: 'error',
            timer: 1000,
            showConfirmButton: false,
          });
        }
      }
    }
    );
  }
}
