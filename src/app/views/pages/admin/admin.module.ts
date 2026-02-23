import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from '../../layout/shared-module/primeng.module';
import { SharedModule } from '../../layout/shared-module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: 'products',
    component: ProductsComponent
  }
]

@NgModule({
  declarations: [ProductsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    PrimeNgModule,
  ]
})
export class AdminModule { }
