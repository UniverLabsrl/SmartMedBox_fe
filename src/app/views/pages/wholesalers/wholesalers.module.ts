import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilieraComponent } from './filiera/filiera.component';
import { MagazzinoComponent } from './magazzino/magazzino.component';
import { PrimeNgModule } from '../../layout/shared-module/primeng.module';
import { SharedModule } from '../../layout/shared-module/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';


const routes: Routes = [
  {
    path: '',
    component: FilieraComponent
  },
  {
    path: 'filiera',
    component: FilieraComponent
  },
  {
    path: 'magazzino',
    component: MagazzinoComponent
  }

]

@NgModule({
  declarations: [
    FilieraComponent,
    MagazzinoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    PrimeNgModule,
    NgApexchartsModule,
  ]
})

export class WholesalersModule { }
