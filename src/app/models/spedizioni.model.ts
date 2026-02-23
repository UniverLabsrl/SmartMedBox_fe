import { ISupplyChainNetwork, IUser } from "./user.model";

export interface ISpedizionis {
    id: number,
    nome: string,
    name: string,
    product: string,
    father_id: number,
    batch_number: string,
    units: string,
    bottle_capacity: string,
    qty: string | number,
    size: string,
    category: string,
    tipologia_di_prodotto: IProdotti_disponibili,
    tipologia_di_imballaggio: string,
    id_sensore: string,
    sensor_code: string,
    descrizione_del_prodotto: string,
    data_di_raccolto: string,
    harvest_time: Date,
    indirizzo: string,
    cap: string,
    citta: string,
    stato: string,
    destinatario: ISupplyChainNetwork,
    temperatura_media: string,
    status: string,
    transactions: ITransactions[],
    delivery_time_string: string;
    delivery_time: Date;
    assigned_driver: IUser
}

export interface IProdotti_disponibili {
    id: number,
    nome_prodotto: string,
    algorithm_type: number,
    reference_temperature_1: string,
    shelflife_rt_1: string,
    reference_temperature_2: string,
    shelflife_rt_2: string,
    reference_temperature_3: string,
    shelflife_rt_3: string,
    k1: string,
    k2: string,
    k3: string,
    humidity_coefficients: IHumidityCoefficients[];
}

export interface IHumidityCoefficients {
    id: number,
    product_id: string,
    from_humidity: number,
    to_humidity: number,
    coefficient: number,
}

export interface ITransactions {
    id: number,
    codice: number,
    prodotto: ISpedizionis,
    trasportatore: IUser,
    data_di_carico: string,
    data_di_scarico: string,
    stato: string
    type: string
}
