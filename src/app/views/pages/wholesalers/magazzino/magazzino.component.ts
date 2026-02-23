import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { RequestResponse } from 'src/app/models/response.model';
import { SpedizioniService } from 'src/app/services/spedizioni.service';
import { SupplyChainNetworkService } from 'src/app/services/supplyChainNetwork.service';
import { WholeSalerService } from 'src/app/services/wholesaler.service';
import Swal from 'sweetalert2';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke
} from "ng-apexcharts";
import { Observable, forkJoin } from 'rxjs';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};
@Component({
  selector: 'app-magazzino',
  templateUrl: './magazzino.component.html',
  styleUrls: ['./magazzino.component.scss']
})
export class MagazzinoComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent | any;
  public humiditychartOptions: Partial<ChartOptions> | any;
  public tempraturechartOptions: Partial<ChartOptions> | any;
  public cov1chartOptions: Partial<ChartOptions> | any;
  public cov2chartOptions: Partial<ChartOptions> | any;
  public cov3chartOptions: Partial<ChartOptions> | any;
  public cov4chartOptions: Partial<ChartOptions> | any;
  public cov5chartOptions: Partial<ChartOptions> | any;
  public lightchartOptions: Partial<ChartOptions> | any;
  public vibrationchartOptions: Partial<ChartOptions> | any;

  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'xl',
    centered: true,
    scrollable: true
  }

  // primeNg table setup
  magazzinos: any = [];
  columns = ['id', 'product', 'sensor', 'batch', 'qty', 'shipping', 'packaging', 'producer', 'equivalent_temperature', 'in_warehouse_since'];
  Filteredcolumns = ['id', 'product', 'sensor', 'batch', 'qty', 'shipping', 'tipologia_di_imballaggio', 'user.nome'];
  cols: any[] = [];
  _selectedColumns: any[] = [];

  maxDateValue = new Date();
  temps: number[] = [];
  maxTempId: number = 0;
  productDetails: any;
  wholeSalerDeliveryForm: FormGroup | any;
  temperaturesForm: FormGroup | any;
  groupTempsForm: any = {};
  missingParam: boolean = false;
  missingTemp: boolean = false;
  showAIResult: boolean = false;
  submitted = false;
  transporters: any[] = [];
  prodotto_id: any;
  residualShelfLifeType: number = 0;
  residualShelfLifeError: string;
  residualShelfLifeData: any[] = [];
  batchesForm: FormGroup | any;
  groupBatchesForm: any = {};
  batches: number[] = [];
  maxBatchId: number = 0;
  batchesQty: number = 0;
  batchesErrors: any = {};
  batchesErrorsCounter: number = 0;
  isDateBefore = false;
  // charts
  humidities: any = [];
  humiDates: any = [];
  temperatures: any = [];
  tempDates: any = [];
  cov1s: any = [];
  cov1Dates: any = [];
  cov2s: any = [];
  cov2Dates: any = [];
  cov3s: any = [];
  cov3Dates: any = [];
  cov4s: any = [];
  cov4Dates: any = [];
  cov5s: any = [];
  cov5Dates: any = [];
  lights: any = [];
  lightDates: any = [];
  vibrations: any = [];
  vibrationDates: any = [];
  maggazzino: any;
  transaction_id: any;
  expired_date: any;

  calculated_SL: any;
  AI_SL: any;



  constructor(
    private modalService: NgbModal,
    private wholeSalerService: WholeSalerService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private spedizioniService: SpedizioniService,
    private supplyChainNetworkService: SupplyChainNetworkService
  ) { }


  ngOnInit(): void {
    this.tableConfig();
    this.initializeForm();
    this.initilizeHumidityChart();
    this.initilizeTemperatureChart();
    this.initilizeCov1Chart();
    this.initilizeCov2Chart();
    this.initilizeCov3Chart();
    this.initilizeCov4Chart();
    this.initilizeCov5Chart();
    this.initilizeLightChart();
    this.initilizeVibrationChart();
    this.addTemperature();
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') as any);
    this.getTransportersByNetworkOwner(loggedInUser.id);
    this.getAllProductsInWareHouse();

  }

  //#region PrimeNg Table Initialization & Setting

  tableConfig() {
    const disbaledFields = [0, 1];
    this.cols = this.columns.map((column: any, index: any) => {
      return {
        field: column,
        header: this.showKeyAsTitle(column),
        active: disbaledFields.includes(index) ? true : false
      };
    });

    this._selectedColumns = this.cols;
  }

  showKeyAsTitle(key: any) {
    const keys = key.split('_');
    const capKeys = this.capitalizeWords(keys);
    return capKeys.join(' ');
  }

  capitalizeWords(arr: any) {
    return arr.map((element: any) => {
      return element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
    });
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter(col => val.includes(col));
  }

  searchedValue(event: any) {
    return event.target.value;
  }


  //#endregion PrimeNg Table Initialization & Setting

  //#region Form initialization & Setup

  initializeForm() {
    // Form initialization
    this.wholeSalerDeliveryForm = this.formBuilder.group({
      nome: ['', Validators.required],
      indirizzo: ['', Validators.required],
      cap: ['', Validators.required],
      comune: ['', Validators.required],
      country: ['', Validators.required],
      trasportatore: ['', [Validators.required]],
      type: ['External'],
      stato: ['In Transit'],
      prodotto: [''],
      data_di_carico: [moment(new Date()).format('DD-MM-YYYY HH:mm')]
    });
    this.temperaturesForm = new FormGroup(this.groupTempsForm);
    console.log(this.temperaturesForm);
  }

  isValid(controlName: any): boolean {
    return this.wholeSalerDeliveryForm.get(controlName).invalid && this.wholeSalerDeliveryForm.get(controlName).touched;
  }

  get f(): any { return this.wholeSalerDeliveryForm.controls; }

  createTempsControl(i: number): void {
    this.groupTempsForm['delta_' + i] = new FormControl((this.residualShelfLifeType == 3) ? undefined : 24, Validators.pattern('^-?\\d*(\\.\\d{1,})?$'));
    this.groupTempsForm['temp_' + i] = new FormControl(undefined, Validators.pattern('^-?\\d*(\\.\\d{1,})?$'));
    console.log(this.groupTempsForm);
    this.temperaturesForm = new FormGroup(this.groupTempsForm);
    this.temperaturesForm.get('delta_' + i).valueChanges.subscribe((_delta: any) => {
      this.validateDeltaAndTemps();
    });
    this.temperaturesForm.get('temp_' + i).valueChanges.subscribe((_temp: any) => {
      this.validateDeltaAndTemps();
    });
    this.validateDeltaAndTemps();
  }

  addTemperature() {
    this.createTempsControl(this.maxTempId);
    this.temps.push(this.maxTempId);
    this.maxTempId += 1;
  }

  removeTemperature(i: number) {
    this.temps = this.temps.filter((val: number) => val !== i);
    this.temperaturesForm.removeControl('delta_' + i);
    this.temperaturesForm.removeControl('temp_' + i);
    this.validateDeltaAndTemps();
  }

  validateDeltaAndTemps() {
    this.missingParam = (this.temps.length == 0);
    this.temps.forEach((i: number) => {
      if (!((this.temperaturesForm.get('delta_' + i).value && this.temperaturesForm.get('temp_' + i).value) || (!this.temperaturesForm.get('delta_' + i).value && !this.temperaturesForm.get('temp_' + i).value)))
        this.missingParam = true;
    });
    this.temperaturesForm.updateValueAndValidity();
  }

  resetTemperature(type: number, getWarehouseTemp: boolean) {
    console.log("Reset temp")
    this.residualShelfLifeType = type;
    this.temps.forEach((i: number) => {
      this.temperaturesForm.removeControl('delta_' + i);
      this.temperaturesForm.removeControl('temp_' + i);
    });
    this.temps = [];
    this.maxTempId = 0;
    this.addTemperature();
    if (getWarehouseTemp && (this.productDetails && this.productDetails.transazioniHistory)) {

      const params = new HttpParams().set('sensor_id', this.maggazzino.id_sensore).set('shipment_id', this.maggazzino.id).set('type', 'Temperature');
      this.wholeSalerService.GetChartsData(params).subscribe({
        next: (response: RequestResponse) => {
          if (response.status) {
            let sumT: number = 0;
            let countT: number = 0;
            response.data.map((data: any) => {
              if (moment(data.time).isSameOrAfter(moment(this.productDetails.transazioniHistory[this.productDetails.transazioniHistory.length - 1].data_di_carico, 'DD-MM-YYYYTHH:mm'))) {
                sumT += +data.value;
                countT += 1;
              }
            });
            if (countT > 0)
              this.temperaturesForm.patchValue({ 'temp_0': (sumT/countT).toFixed(2) });
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Something go wrong! Please retry, if problem persist contact administrator',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    }
  }

  onSpedizione(prodotto: any) {
    this.transaction_id = prodotto.transazioni_id;
    this.prodotto_id = prodotto.id;
  }

  //#endregion Form initialization & Setup

  
  //#region Rest API calls start

  configureWarehouse(w: any) {
    w.name = w.nome;
    w.qty = +w.qty;
    w.sensor_code = w.id_sensore;
    if (w.product)
      w.product = w.product.nome_prodotto;
    w.type_of_packaging = w.tipologia_di_imballaggio;
    if (w.user)
      w.producer = w.user.nome;
    if (w.in_warehouse_since) {
      w.in_warehouse_since_string = w.in_warehouse_since;
      const [dateValues, timeValues] = w.in_warehouse_since_string.split(' ');
      const [day, month, year] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      w.in_warehouse_since = new Date(+year, +month - 1, +day, +hours, +minutes);
    }
  }

  /*Get All Filieras*/

  getAllProductsInWareHouse() {
    this.spinner.show();
    this.wholeSalerService.GetDeliveredProductsByWholeSaler().subscribe({
      next: (response: RequestResponse) => {
        if (response.status) {
          this.magazzinos = response.data;
          this.magazzinos.forEach((w: any) => {
            this.configureWarehouse(w);
            if (w.father_id)
              this.magazzinos = this.magazzinos.filter((m: any) => m.id != m.father_id);
          });
          this.magazzinos.sort((a: any, b: any) => ((b.in_warehouse_since - a.in_warehouse_since) == 0) ? ((a.batch_number > b.batch_number) ? -1 : 1) : b.in_warehouse_since - a.in_warehouse_since);
          this.spinner.hide();
        } else {
          this.magazzinos = [];
          this.spinner.hide();
        }
      },
      error: () => {
        this.magazzinos = [];
        this.spinner.hide();
      }
    })
  }

  getTransactionHistoryByProduct(magazzino: any) {
    this.maggazzino = magazzino;
    this.spinner.show();
    this.wholeSalerService.GetTransazioniHistory(magazzino.id).subscribe({
      next: (response: RequestResponse) => {
        if (response.status) {
          this.productDetails = response.data;
          this.validateDeltaAndTemps();
          this.spinner.hide();
        } else {
          this.productDetails = null;
          this.spinner.hide();
        }
      },
      error: () => {
        this.productDetails = null;
        this.spinner.hide();
      }
    })
  }

  /*Get All Transporters By NetworkOwner*/
  getTransportersByNetworkOwner(id: any) {
    const params = new HttpParams()
      .set('id', id)
      .set('owner', 'false');
    this.supplyChainNetworkService.GetNetworkByOwner(params).subscribe({
      next: (response: RequestResponse) => {
        if (response.status) {
          this.transporters = response.data;
        }
      },
      error: () => {
        this.transporters = [];
      }
    })
  }

  /*Get Residual Shelf-Life*/
  getResidualShelfLife(shipment_id: number) {
    let params = new HttpParams()
      .set('shipment_id', shipment_id);
    this.missingTemp = true;
    let ids: string = '';

    this.temps.forEach((i: number) => {

      if (this.temperaturesForm.get('temp_' + i).value) {

        params = params.append('delta_' + i, this.temperaturesForm.get('delta_' + i).value);
        params = params.append('temp_' + i, this.temperaturesForm.get('temp_' + i).value);
        ids += ((ids !== '') ? ',' : '') + i;
        this.missingTemp = false;
      }
    });
    if (!this.missingTemp) {
      this.residualShelfLifeError = '';
      this.residualShelfLifeData = [];
      params = params.append('ids', ids);
      this.wholeSalerService.CalculateResidualShelfLife(params).subscribe({
        next: (response: RequestResponse) => {
          if (response.status) {
            response.data.from_crop_day = Math.ceil(response.data.from_crop);
            response.data.shelflife_date =  moment().add(response.data.residual_shelflife, 'd').format('DD/MM/YYYY');
            this.residualShelfLifeData = [ response.data ];
            this.resetTemperature(0, false);
          } else {
            this.residualShelfLifeError = response.message;
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Something go wrong! Please retry, if problem persist contact administrator',
            showConfirmButton: false,
            timer: 3000
          });
        }
      })
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.wholeSalerDeliveryForm.invalid) {
      return;
    }
    this.wholeSalerDeliveryForm.value.prodotto = this.prodotto_id;
    this.wholeSalerDeliveryForm.value.transazioni_id = this.transaction_id;

    this.spinner.show();
    this.wholeSalerService.CreateTransactionByWholesaler(this.wholeSalerDeliveryForm.value)
      .subscribe({
        next: (res: any) => {
          if (res.status) {
            this.spinner.hide();
            this.submitted = false;
            this.magazzinos = this.magazzinos.filter((magazzino: any) => magazzino.id != this.prodotto_id);
            document.getElementById('closeModal')?.click();
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Transaction created successfully!',
              showConfirmButton: false,
              timer: 2000
            });
          } else {
            this.spinner.hide();
            this.submitted = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `${res.message}`,
              showConfirmButton: false,
              timer: 3000
            });
          }
        },
        error: (_ee: any) => {
          this.spinner.hide();
          this.submitted = false;
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Something go wrong! Please retry, if problem persist contact administrator`,
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
  }

  initilizeHumidityChart() {
    this.humiditychartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }

  initilizeTemperatureChart() {
    this.tempraturechartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }

  initilizeCov1Chart() {
    this.cov1chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }
  initilizeCov2Chart() {
    this.cov2chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }
  initilizeCov3Chart() {
    this.cov3chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }
  initilizeCov4Chart() {
    this.cov4chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }
  initilizeCov5Chart() {
    this.cov5chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }
  initilizeLightChart() {
    this.lightchartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }
  initilizeVibrationChart() {
    this.vibrationchartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      toolbar: {
        show: false
      }
    };
  }

  getValue(array: any, type: string) {
    if (type === 'max') {
      return Math.max(...array) ? Math.max(...array) : 0;
    } else {
      return Math.min(...array) ? Math.min(...array) : 0;
    }
  }

  getChartData(type: string) {
    if (this.temperatures.length == 0 || this.humidities.length == 0) {
      this.spinner.show();
      const params = new HttpParams().set('sensor_id', this.maggazzino.id_sensore).set('shipment_id', this.maggazzino.id).set('type', type);
      this.wholeSalerService.GetChartsData(params).subscribe({
        next: (response: RequestResponse) => {
          if (response.status) {
            if (type == 'Temperature') {
              response.data.map((data: any) => {
                this.temperatures.push(+data.value);
                this.tempDates.push(data.time);
              });
              setTimeout(() => {
                if (this.temperatures.length > 0) {
                  this.tempraturechartOptions = {
                    series: [
                      {
                        name: "Temperature",
                        data: this.temperatures
                      }
                    ],
                    chart: {
                      height: 350,
                      type: "area",
                      toolbar: {
                        show: false
                      }
                    },
                    dataLabels: {
                      enabled: false
                    },
                    stroke: {
                      curve: "smooth"
                    },
                    xaxis: {
                      type: "datetime",
                      categories: this.tempDates
                    },
                    tooltip: {
                      x: {
                        format: "dd/MM/yy HH:mm"
                      }
                    }
                  };
                }
                this.spinner.hide();

              }, 1000);
            } 
            else if(type == 'Humidity')  {
              response.data.map((data: any) => {
                this.humidities.push(+data.value);
                this.humiDates.push(data.time);
                setTimeout(() => {
                  if (this.humidities.length > 0) {
                    // this.sortByDate(this.humiDates)
                    this.humiditychartOptions = {
                      series: [
                        {
                          name: "Humidity",
                          data: this.humidities
                        }
                      ],
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: false
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      stroke: {
                        curve: "smooth"
                      },
                      xaxis: {
                        type: "datetime",
                        categories: this.humiDates
                      },
                      tooltip: {
                        x: {
                          format: "dd/MM/yy HH:mm"
                        }
                      }
                    };
                  }
                  this.spinner.hide();
                }, 1000);
              });
            }
            else if(type == 'cov1')  {
              response.data.map((data: any) => {
                this.cov1s.push(+data.value);
                this.cov1Dates.push(data.time);
                setTimeout(() => {
                  if (this.cov1s.length > 0) {
                    // this.sortByDate(this.humiDates)
                    this.cov1chartOptions = {
                      series: [
                        {
                          name: "Cov1",
                          data: this.cov1s
                        }
                      ],
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: false
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      stroke: {
                        curve: "smooth"
                      },
                      xaxis: {
                        type: "datetime",
                        categories: this.cov1Dates
                      },
                      tooltip: {
                        x: {
                          format: "dd/MM/yy HH:mm"
                        }
                      }
                    };
                  }
                  this.spinner.hide();
                }, 1000);
              });
            }
            else if(type == 'cov2')  {
              response.data.map((data: any) => {
                this.cov2s.push(+data.value);
                this.cov2Dates.push(data.time);
                setTimeout(() => {
                  if (this.cov2s.length > 0) {
                    // this.sortByDate(this.humiDates)
                    this.cov2chartOptions = {
                      series: [
                        {
                          name: "Cov2",
                          data: this.cov2s
                        }
                      ],
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: false
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      stroke: {
                        curve: "smooth"
                      },
                      xaxis: {
                        type: "datetime",
                        categories: this.cov2Dates
                      },
                      tooltip: {
                        x: {
                          format: "dd/MM/yy HH:mm"
                        }
                      }
                    };
                  }
                  this.spinner.hide();
                }, 1000);
              });
            }
            else if(type == 'cov3')  {
              response.data.map((data: any) => {
                this.cov3s.push(+data.value);
                this.cov3Dates.push(data.time);
                setTimeout(() => {
                  if (this.cov3s.length > 0) {
                    // this.sortByDate(this.humiDates)
                    this.cov3chartOptions = {
                      series: [
                        {
                          name: "Cov3",
                          data: this.cov3s
                        }
                      ],
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: false
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      stroke: {
                        curve: "smooth"
                      },
                      xaxis: {
                        type: "datetime",
                        categories: this.cov3Dates
                      },
                      tooltip: {
                        x: {
                          format: "dd/MM/yy HH:mm"
                        }
                      }
                    };
                  }
                  this.spinner.hide();
                }, 1000);
              });
            }
            else if(type == 'cov4')  {
              response.data.map((data: any) => {
                this.cov4s.push(+data.value);
                this.cov4Dates.push(data.time);
                setTimeout(() => {
                  if (this.cov4s.length > 0) {
                    // this.sortByDate(this.humiDates)
                    this.cov4chartOptions = {
                      series: [
                        {
                          name: "Cov4",
                          data: this.cov4s
                        }
                      ],
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: false
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      stroke: {
                        curve: "smooth"
                      },
                      xaxis: {
                        type: "datetime",
                        categories: this.cov4Dates
                      },
                      tooltip: {
                        x: {
                          format: "dd/MM/yy HH:mm"
                        }
                      }
                    };
                  }
                  this.spinner.hide();
                }, 1000);
              });
            }
            else if(type == 'cov5')  {
              response.data.map((data: any) => {
                this.cov5s.push(+data.value);
                this.cov5Dates.push(data.time);
                setTimeout(() => {
                  if (this.cov5s.length > 0) {
                    // this.sortByDate(this.humiDates)
                    this.cov5chartOptions = {
                      series: [
                        {
                          name: "Cov5",
                          data: this.cov5s
                        }
                      ],
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: false
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      stroke: {
                        curve: "smooth"
                      },
                      xaxis: {
                        type: "datetime",
                        categories: this.cov5Dates
                      },
                      tooltip: {
                        x: {
                          format: "dd/MM/yy HH:mm"
                        }
                      }
                    };
                  }
                  this.spinner.hide();
                }, 1000);
              });
            }
            else if(type == 'light')  {
              response.data.map((data: any) => {
                this.lights.push(+data.value);
                this.lightDates.push(data.time);
                setTimeout(() => {
                  if (this.lights.length > 0) {
                    this.lightchartOptions = {
                      series: [
                        {
                          name: "Light",
                          data: this.lights
                        }
                      ],
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: false
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      stroke: {
                        curve: "smooth"
                      },
                      xaxis: {
                        type: "datetime",
                        categories: this.lightDates
                      },
                      tooltip: {
                        x: {
                          format: "dd/MM/yy HH:mm"
                        }
                      }
                    };
                  }
                  this.spinner.hide();
                }, 1000);
              });
            }
            else if(type == 'vibration')  {
              response.data.map((data: any) => {
                this.vibrations.push(+data.value);
                this.vibrationDates.push(data.time);
                setTimeout(() => {
                  if (this.vibrations.length > 0) {
                    this.vibrationchartOptions = {
                      series: [
                        {
                          name: "Vibrations",
                          data: this.vibrations
                        }
                      ],
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: false
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      stroke: {
                        curve: "smooth"
                      },
                      xaxis: {
                        type: "datetime",
                        categories: this.vibrationDates
                      },
                      tooltip: {
                        x: {
                          format: "dd/MM/yy HH:mm"
                        }
                      }
                    };
                  }
                  this.spinner.hide();
                }, 1000);
              });
            }
          } else {
            this.initializeChartData();
            this.spinner.hide();
          }
        },
        error: () => {
          this.initializeChartData();
          this.spinner.hide();
        }
      })
    }

  }
  initializeChartData() {
    this.humidities = [];
    this.humiDates = [];
    this.temperatures = [];
    this.tempDates = [];
  }
  //#endregion Rest API calls End

  createBatchesControl(i: number): void {
    let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'Y', 'X', 'Z']
    this.groupBatchesForm['batch_number_' + i] = new FormControl(this.maggazzino.batch_number + '-' + ((i < 26) ? letters[i] : (i - 25)), [ Validators.required ]);
    this.groupBatchesForm['id_sensore_' + i] = new FormControl(this.maggazzino.id_sensore, []);
    this.groupBatchesForm['category_' + i] = new FormControl(undefined, []);
    this.groupBatchesForm['size_' + i] = new FormControl(undefined, []);
    this.groupBatchesForm['qty_' + i] = new FormControl(undefined, [ Validators.required, Validators.pattern('^\\d*(\\.\\d{1,})?$') ]);
    this.batchesForm = new FormGroup(this.groupBatchesForm);
    this.batchesForm.get('qty_' + i).valueChanges.subscribe((_qty: number) => {
      this.validateQuantities();
    });
  }

  addBatch() {
    this.createBatchesControl(this.maxBatchId);
    this.batches.push(this.maxBatchId);
    this.maxBatchId += 1;
    this.validateQuantities();
  }

  removeBatch(i: number) {
    this.batches = this.batches.filter((val: number) => val !== i);
    this.batchesForm.removeControl('batch_number_' + i);
    this.batchesForm.removeControl('id_sensore_' + i);
    this.batchesForm.removeControl('category_' + i);
    this.batchesForm.removeControl('size_' + i);
    this.batchesForm.removeControl('qty_' + i);
    this.maxBatchId -= 1;
    this.validateQuantities();
  }

  validateQuantities() {
    this.batchesErrors = {};
    this.batchesErrorsCounter = 0;
    this.batchesQty = 0;
    this.batches.forEach((i: number) => {
      this.batchesQty += +this.batchesForm.get('qty_' + i).value;
    });
    if (this.batchesQty.toFixed(4) != this.maggazzino.qty.toFixed(4)) {
      this.batchesErrors['quantities'] = true;
      this.batchesErrorsCounter++;
    }
    this.batchesForm.updateValueAndValidity();
  }

  resetBatchesForm() {
    this.maxBatchId = 0;
    this.batchesQty = 0;
    this.batches = [];
    this.groupBatchesForm = [];
  }

  divideBatches() {
    this.spinner.show();
    let requests: Observable<any>[] = [];
    this.batches.forEach((i: number) => {
      let shipping = JSON.parse(JSON.stringify(this.maggazzino));
      shipping.father_id = this.maggazzino.id;
      shipping.id = null;
      shipping.batch_number = this.batchesForm.get('batch_number_' + i).value;
      shipping.id_sensore = this.batchesForm.get('id_sensore_' + i).value;
      shipping.size = this.batchesForm.get('size_' + i).value;
      shipping.category = this.batchesForm.get('category_' + i).value;
      shipping.qty = this.batchesForm.get('qty_' + i).value;
      requests.push(this.spedizioniService.CreateSpedizioni(shipping));
    });
    forkJoin(requests).subscribe({
      next: (res: any) => {
        res.forEach((result: any) => {
          if (result.status) {
            this.configureWarehouse(result);
            this.magazzinos.unshift(result.data);
            this.magazzinos.sort((a: any, b: any) => (a.delivery_time < b.delivery_time ? 1 : (a.delivery_time > b.delivery_time) ? -1 : (a.batch_number < b.batch_number ? 1 : -1)));
          } else {
            this.spinner.hide();
            this.submitted = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `${result.message}`,
              showConfirmButton: false,
              timer: 3000
            });
          }
		});
        this.spinner.hide();
        this.submitted = false;
        this.getAllProductsInWareHouse();
        document.getElementById('closeModal')?.click();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Batches created successfully!',
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: (_ee: any) => {
        this.spinner.hide();
        this.submitted = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Something go wrong! Please retry, if problem persist contact administrator`,
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }
  
  initBatches() {
    this.addBatch();
    this.addBatch();
  }

  /*Handle Popup & Form Setup*/
  onModalClick(content: TemplateRef<any>) {
    this.modalService.open(content, this.ngbModalOptions).result.then(() => {
      this.initializeForm();
      this.submitted = false;
      this.showAIResult = false;
      this.productDetails = null;
      this.maggazzino = null;
      this.prodotto_id = null;
      this.initializeChartData();
    }).catch(() => {
      this.initializeForm();
      this.submitted = false;
      this.productDetails = null;
      this.prodotto_id = null;
      this.maggazzino = null;
      this.initializeChartData();
    });
  }

  showSetExpiredDate(){
    this.resetTemperature(1, true);
    this.residualShelfLifeType = 4;
  }
  setExpiredDate(){
    
    let params = new HttpParams()
        .set('date', this.expired_date)
        .set('shipment_id', this.maggazzino.id);


    this.missingTemp = true;
    let ids: string = '';

    this.temps.forEach((i: number) => {
      if (this.temperaturesForm.get('temp_' + i).value) {

        params = params.append('delta_' + i, this.temperaturesForm.get('delta_' + i).value);
        params = params.append('temp_' + i, this.temperaturesForm.get('temp_' + i).value);
        ids += ((ids !== '') ? ',' : '') + i;
        this.missingTemp = false;
      }
    });
    if (!this.missingTemp) {
      this.residualShelfLifeError = '';
      this.residualShelfLifeData = [];
      params = params.append('ids', ids);
      
      this.spedizioniService.SetManualExpirationDate(params)
        .subscribe({
          next: (res: any) => {
            console.log({ res });
            if (res.status) {
              this.spinner.hide();
              
              document.getElementById('closeModal')?.click();
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Date saved successfully!',
                showConfirmButton: false,
                timer: 2000
              });
            } else {
              this.spinner.hide();

              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `${res.message}`,
                showConfirmButton: false,
                timer: 3000
              });
            }
          },
          error: (ee: any) => {
            console.log('ee', ee);
            this.spinner.hide();

            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `Something go wrong! Please retry, if problem persist contact administrator`,
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
    }//fine if
  }
  onSelectDate() {
  }

  useAI(){
    this.resetTemperature(1, true);
    this.residualShelfLifeType = -1;
    this.showAIResult = true;
  }

  calculateWithAI(){
    this.spinner.show();

    //console.log(this.maggazzino);
    //return; 

    let params = new HttpParams()
        .set('shipment_id', this.maggazzino.id);
    params = params.append('sensor_id', this.maggazzino.id_sensore);
    params = params.append('product_type', this.maggazzino.tipologia_di_prodotto);
    this.missingTemp = true;
    let ids: string = '';

    this.temps.forEach((i: number) => {
      if (this.temperaturesForm.get('temp_' + i).value) {

        params = params.append('delta_' + i, this.temperaturesForm.get('delta_' + i).value);
        params = params.append('temp_' + i, this.temperaturesForm.get('temp_' + i).value);
        ids += ((ids !== '') ? ',' : '') + i;
        this.missingTemp = false;
      }
    });
      

    if (true) {
      this.residualShelfLifeError = '';
      this.residualShelfLifeData = [];
      params = params.append('ids', ids);
      
      this.spedizioniService.GetAIPrediction(params)
        .subscribe({
          next: (res: any) => {
            console.log({ res });
            if (res.status) {
              this.spinner.hide();
              //this.calculated_SL = res.data[0].formula_result; 
              this.AI_SL = res.data.predicted_shelf_life;
              
            } else {
              this.spinner.hide();

              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `${res.message}`,
                showConfirmButton: false,
                timer: 3000
              });
            }
          },
          error: (ee: any) => {
            console.log('ee', ee);
            this.spinner.hide();

            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `Something go wrong! Please retry, if problem persist contact administrator`,
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
    }
  }
}
