import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WholeSalerService {
    constructor(
        private http: HttpClient
    ) { }

    GetProductsByWholeSaler(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getProductsByWholeSaler`);
    }

    GetDeliveredProductsByWholeSaler(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getDeliveredProductsByWholeSaler`);
    }

    GetTransazioniHistory(id: any): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getTransazioniHistory/${id}`);
    }

    GetChartsData(param: any): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getChartsData?${param}`);
    }

    CalculateResidualShelfLife(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/calculateResidualShelfLife`, body);
    }

    CreateTransactionByWholesaler(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/createTransactionByWholesaler`, body);
    }

}
