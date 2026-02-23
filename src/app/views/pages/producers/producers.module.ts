import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from '../../layout/shared-module/primeng.module';
import { SharedModule } from '../../layout/shared-module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { SpedizioniComponent } from './spedizioni/spedizioni.component';

const routes: Routes = [
  {
    path: 'spedizioni',
    component: SpedizioniComponent
  }

]

@NgModule({
  declarations: [SpedizioniComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    PrimeNgModule,
  ]
})
export class ProducersModule { }
