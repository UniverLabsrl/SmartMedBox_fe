import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseComponent } from './views/layout/base/base.component';
import { AuthGuard } from './guard/auth.guard';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';
import { FiliereComponent } from './views/pages/filiere/filiere.component';
import { SettingsComponent } from './views/pages/settings/settings.component';


const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./views/pages/auth/auth.module').then(m => m.AuthModule) },
  {
    path: '',
    component: BaseComponent,
    canActivate: [AuthGuard],
    data: { role: ['Produttore', 'Trasportatore', 'Admin', 'Wholesaler'] },
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./views/pages/admin/admin.module').then(m => m.AdminModule),
        canActivate: [AuthGuard],
        data: { role: ['Admin'] }
      },
      {
        path: 'producer',
        loadChildren: () => import('./views/pages/producers/producers.module').then(m => m.ProducersModule),
        canActivate: [AuthGuard],
        data: { role: ['Produttore'] }
      },
      {
        path: 'driver',
        loadChildren: () => import('./views/pages/drivers/drivers.module').then(m => m.DriversModule),
        canActivate: [AuthGuard],
        data: { role: ['Trasportatore'] }
      },
      {
        path: 'wholesaler',
        loadChildren: () => import('./views/pages/wholesalers/wholesalers.module').then(m => m.WholesalersModule),
        canActivate: [AuthGuard],
        data: { role: ['Wholesaler'] }
      },
      {
        path: 'filiere',
        component: FiliereComponent,
        canActivate: [AuthGuard],
        data: { role: ['Produttore', 'Trasportatore'] }
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      { path: '', redirectTo: 'filiere', pathMatch: 'full' }
    ]
  },
  {
    path: 'error',
    component: ErrorPageComponent,
    data: {
      'type': 404,
      'title': 'Page Not Found',
      'desc': 'Oopps!! The page you were looking for doesn\'t exist.'
    }
  },
  {
    path: 'error/:type',
    component: ErrorPageComponent
  },
  { path: '**', redirectTo: 'error', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
