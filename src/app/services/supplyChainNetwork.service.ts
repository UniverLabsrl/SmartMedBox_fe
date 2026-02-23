import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class SupplyChainNetworkService {
    constructor(
        private http: HttpClient
    ) { }


    CheckSpplyChainCode(code: any): Observable<any> {
        return this.http.get(`${environment.baseUrl}/checkCodice/${code}`);
    }

    GetNetworkByStatus(status: any): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getNetworkStatus/${status}`);
    }

    GetNetworkByOwner(params: any): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getNetworkByOwner?${params}`);
    }

    DeactivateSpplyChainNetwork(id: any): Observable<any> {
        return this.http.get(`${environment.baseUrl}/changeFiliereStatus/${id}`);
    }

    GetSupplyChainNetwork(): Observable<any> {
        return this.http.get(`${environment.baseUrl}/getNetwork`);
    }

    AddSupplyChainCode(body: any): Observable<any> {
        return this.http.post(`${environment.baseUrl}/createFiliere`, body);
    }

}

