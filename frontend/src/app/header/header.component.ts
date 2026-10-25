import { Component,EventEmitter,OnInit,Output } from '@angular/core';
import { LoggedinService } from '../service/loggedin.service';
import { ApiService } from '../service/api.service';
import { SearchService } from '../service/search.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HeaderidentifierService } from '../service/headeridentifier.service';
import { UsernameService } from '../service/username.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  show:any;
  menuOpen:boolean=false;
  constructor(public headerid: HeaderidentifierService ,public name: UsernameService,public auth:LoggedinService, private search: SearchService, private router: Router, private toastr:ToastrService){}
   searchValue:string='';
   
   ngOnInit(): void {
       this.show=this.headerid.IsProductPage();
       console.log("show",this.show)
       const username=this.name.getUserName();
       console.log("username is",username)
   }
  //  changeSearchValue(eventData:Event){
  //    this.searchValue=(<HTMLInputElement>eventData.target).value;
  //  }

   @Output()
   Searchtextchanged: EventEmitter<string>=new EventEmitter<string>();

   onSearchtextchanged(){
    this.Searchtextchanged.emit(this.searchValue);
    this.search.setSearchValue(this.searchValue);
   
   }
   login(){
    this.auth.login();
    
   }
   logout() {
    Swal.fire({
      title: 'Log out of Eshopping?',
      showCancelButton: true,
      confirmButtonText: 'Log out',
    
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logged out',
          text: 'Log in again to keep shopping.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        }).then(() => {
          this.auth.logout();
          this.router.navigate(['login']);
        });
      }
    });
  }
   
}
























 