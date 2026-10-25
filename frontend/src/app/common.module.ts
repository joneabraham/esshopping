import { NgModule } from "@angular/core";
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";

@NgModule({
declarations:[
    HeaderComponent,
    FooterComponent
],
exports:[
    HeaderComponent,
    FooterComponent
],
imports:[
    FormsModule,
    BrowserModule,
    AppRoutingModule
]
})
export class SimilarModule{}