import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class SpedizioniService {
    constructor(
        private http: HttpClient
    ) { }

    DeleteSpedizioni(id: any): Observable<any> {
        return this.http.delete(`${environment.baseUrl}/deleteShipment/${id}`);
    }

    CreateProduct(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/createProduct`, body);
    }

    UpdateProduct(id: number, body: any): Observable<any> {
        return this.http.put(`${environment.baseUrl}/updateProduct/${id}`, body);
    }

    DeleteProduct(id: number): Observable<any> {
        return this.http.delete(`${environment.baseUrl}/deleteProduct/${id}`);
    }

    GetProdottis(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getProdottis`);
    }

    GetSpedizionis(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getSpedizionis`);
    }

    CreateSpedizioni(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/createShipment`, body);
    }

    AssignTransporter(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/assignTransporter`, body);
    }

    GetProdottisFromTrick(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getProdottisFromTrick`);
    }

    GetBatchesFromTrick(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getBatchesFromTrick`);
    }
    SetManualExpirationDate(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/setManualExpirationDate`, body);
    }
    GetAIPrediction(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/getAIPrediction`, body);
    }
}

