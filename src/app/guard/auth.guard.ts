import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isLoggedIn()) {
      const role = route?.data?.role;
      // console.log('role', role);
      const userRole: any = localStorage.getItem('userRole');
      if (role.includes(userRole)) {
        return true;
      } else {
        const returnUrl = this.redirectByRole(userRole);
        this.router.navigate([`/${returnUrl}`])
        return false;
      }
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  redirectByRole(role: string) {
    if (role) {
      switch (role) {
        case 'Admin':
          return 'admin/products';
        case 'Produttore':
          return 'filiere';
        case 'Trasportatore':
          return 'filiere';
        case 'Wholesaler':
          return 'wholesaler/filiera';
        default:
          return 'filiere';
        // code block
      }
    } else {
      return 'auth/login';
    }
  }


}