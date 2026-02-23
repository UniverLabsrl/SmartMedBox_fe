import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private http: HttpClient
    ) { }


    Login(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/auth/login`, body);
    }

    Register(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/auth/register`, body);
    }

    ForgotPassword(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/forget-password`, body);
    }

    ChangePassword(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/auth/changePassword`, body);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('SLMToken');
    }

    Logout(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/auth/logout`);
    }

    checkTrickUrl(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/auth/checkTrickUrl`);
    }
}

