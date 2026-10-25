import { NgModule} from '@angular/core'
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BodyComponent } from './body/body.component';
import { ProductComponent } from './product/product.component';
import { FilterComponent } from './filter/filter.component';
import { TestComponent } from './test/test.component';
import { SampleDirective } from './customdirective/sample.directive';
import { ClickeventDirective } from './customdirective/clickevent.directive';
import { HighlightDirective } from './customdirective/highlight.directive';
import { IfcaseDirective } from './customdirective/ifcase.directive';
import { Sample1Component } from './sample1/sample1.component';
import { Sample2Component } from './sample2/sample2.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { SignupComponent } from './signup/signup.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { ButtonstyleDirective } from './customdirective/buttonstyle.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuard } from './service/auth.guard';
import { TokenvalidationService } from './service/tokenvalidation.service';
import { CookieService } from 'ngx-cookie-service';
import { LoaderComponent } from './loader/loader.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { SliderComponent } from './slider/slider.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginModule } from './login.module';
import { SimilarModule } from './common.module';
import { StoreModule } from '@ngrx/store';
import { counterreducer } from './store-ngrx/counter.reducer';
import { EffectsModule } from '@ngrx/effects';
import { CounterEffects } from './store-ngrx/counter.effect';

@NgModule({
  declarations: [
    AppComponent,
    BodyComponent,
    ProductComponent,
    FilterComponent,
    TestComponent,
    SampleDirective,
    ClickeventDirective,
    HighlightDirective,
    IfcaseDirective,
    Sample1Component,
    Sample2Component,
    ContactComponent,
    AboutComponent,
    SignupComponent,
    LoginComponent,
    ButtonstyleDirective,
    LoaderComponent,
    SliderComponent,
 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    CarouselModule.forRoot(),
    FontAwesomeModule,
    SimilarModule,
    LoginModule,
    StoreModule.forRoot({
      counter:counterreducer
    }),
    EffectsModule.forRoot([CounterEffects])
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenvalidationService,
      multi: true,
    },
    CookieService,
    ToastrService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
