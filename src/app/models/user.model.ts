export interface IUser {
    id: number,
    nome: string,
    indirizzo: string,
    cap: string,
    citta: string,
    stato: string,
    email: string,
    password: string,
    codice: string,
    terms: boolean,
    role: string,
}


export interface ISupplyChainNetwork {
    id: number,
    network_owner: IUser,
    network_user: IUser
    status: string,
}




