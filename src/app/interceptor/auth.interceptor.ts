import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${localStorage.getItem('SLMToken')}`,
        'accept': 'application/json'
      },
    });

    return next.handle(req).pipe(catchError(err => {
      if ([401, 403].indexOf(err.status) !== -1) {
        localStorage.removeItem('SLMToken');
        localStorage.removeItem('loggedInUser');
        this.router.navigate(['/auth/login']);
      }

      const error = err || err.statusText;
      return throwError(error);
    }))
  }
}
