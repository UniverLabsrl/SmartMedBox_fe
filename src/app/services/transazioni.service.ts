import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class TransazioniService {
    constructor(
        private http: HttpClient
    ) { }


    AcceptTransazioni(params: any): Observable<any> {
        return this.http.get(`${environment.baseUrl}/acceptTransazioni?${params}`);
    }

    RejectTransazioni(id: any): Observable<any> {
        return this.http.get(`${environment.baseUrl}/rejectTransazioni/${id}`);
    }

    GetTransazionis(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getTransazionis`);
    }

    AssignTransazioni(body: any, id: any): Observable<any> {
        return this.http.put(`${environment.baseUrl}/assignTransazioni/${id}`, body);
    }

}

