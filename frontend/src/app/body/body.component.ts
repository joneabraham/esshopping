import { Component,Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn, fadeInRight, fadeInUp } from 'ng-animate';
import * as AOS from 'aos';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
  animations: [
    trigger('fadeIn', [
      transition('* => *', useAnimation(fadeIn, {
        params: { timing: 0.4, delay: 0 }
      }))
    ]),
    trigger('fadeInUp', [
      transition('* => *', useAnimation(fadeInUp, {
        params: { timing: 0.6, delay: 0.2 }
      }))
    ])
 ]
})
export class BodyComponent  {
  constructor(private router: Router) { }

  

    button:string='Click here';
    buttonClicked: boolean = false;
    
    @Input() search:string='';
     
    searchn:string='';
     
   onvalue(data:string){
      this.searchn=data;
      console.log(this.searchn)
    }

    // click() {
    //   this.router.navigate(['products'], { queryParams: { search: this.searchn } });
    //   console.log("clicked");
    // }
    
    hi:boolean=false
    hiClicked(){
        this.hi=true;
        console.log(this.hi)
    }
  }