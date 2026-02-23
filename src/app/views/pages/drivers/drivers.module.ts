import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransazionisComponent } from './transazionis/transazionis.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../layout/shared-module/shared.module';
import { PrimeNgModule } from '../../layout/shared-module/primeng.module';

const routes: Routes = [
  {
    path: 'transazioni',
    component: TransazionisComponent
  }

]

@NgModule({
  declarations: [TransazionisComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    PrimeNgModule,
  ]
})

export class DriversModule { }
