import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { WizardComponent } from 'angular-archwizard';
import { NgxSpinnerService } from 'ngx-spinner';
import { RequestResponse } from 'src/app/models/response.model';
import { WholeSalerService } from 'src/app/services/wholesaler.service';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke
} from "ng-apexcharts";
import { HttpParams } from '@angular/common/http';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-filiera',
  templateUrl: './filiera.component.html',
  styleUrls: ['./filiera.component.scss']
})
export class FilieraComponent implements OnInit {
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
  filieras: any[] = [];

  columns = ['producer_name', 'batch_number', 'product', 'quantity', 'production_time', 'status'];
  Filteredcolumns = ['user.nome', 'batch_number', 'nome', 'peso', 'data_di_raccolta', 'status'];
  cols: any[] = [];
  _selectedColumns: any[] = [];

  maxDateValue = new Date();
  loggedInUser: any;
  productDetails: any;

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
  filera: any;
  constructor(
    private modalService: NgbModal,
    private wholeSalerService: WholeSalerService,
    private spinner: NgxSpinnerService
  ) { }


  ngOnInit(): void {
    this.tableConfig();
    this.getAllFilieras();
    this.initilizeTemperatureChart();
    this.initializeHumidityChart();
    this.initilizeCov1Chart();
    this.initilizeCov2Chart();
    this.initilizeCov3Chart();
    this.initilizeCov4Chart();
    this.initilizeCov5Chart();
    this.initilizeLightChart();
    this.initilizeVibrationChart();
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') as any);
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

  getStatusWithColor(prodotto: any): any {
    if (!prodotto?.assigned_driver && prodotto?.status !== 'Ended') {
      return { bg: '#E5B9A0', text: '#B55E0E', title: 'Pending' };
    } else if (prodotto?.assigned_driver && prodotto?.assigned_driver !== this.loggedInUser.id && prodotto?.status !== 'Ended') {
      return { bg: '#DCFCE7', text: '#166534', title: 'In Transit' };
    } else if (prodotto?.assigned_driver == this.loggedInUser.id && prodotto?.status !== 'Ended') {
      return { bg: '#DEEEF7', text: '#0025A9', title: 'In Warehouse' };
    } else if (prodotto?.status == 'Ended') {
      return { bg: '#FEE2E2', text: '#991B1B', title: 'Ended' };
    }
  }

  //#endregion PrimeNg Table Initialization & Setting



  //#region Rest API calls start

  configureSupplyChain(s: any) {
    if (s.user)
      s.producer_name = s.user.nome;
    s.product = s.nome;
    s.quantity = +s.qty;
    if (s.data_di_raccolto) {
      const [dateValues, timeValues] = s.data_di_raccolto.split(' ');
      const [day, month, year] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      s.harvest_time = new Date(+year, +month - 1, +day, +hours, +minutes);
    }
  }

  /*Get All Filieras*/

  getAllFilieras() {
    this.spinner.show();
    this.wholeSalerService.GetProductsByWholeSaler().subscribe({
      next: (response: RequestResponse) => {
        console.log('response prodottos', response);
        if (response.status) {
          this.filieras = response.data;
          this.filieras.forEach((f: any) => {
            this.configureSupplyChain(f);
          });
          this.filieras.sort((a: any, b: any) => b.harvest_time - a.harvest_time);
          this.spinner.hide();
        } else {
          this.filieras = [];
          this.spinner.hide();
        }
      },
      error: () => {
        this.filieras = [];
        this.spinner.hide();
      }
    })
  }

  getTransactionHistoryByProduct(filera: any) {
    this.filera = filera;
    this.spinner.show();
    this.wholeSalerService.GetTransazioniHistory(filera.id).subscribe({
      next: (response: RequestResponse) => {
        console.log('response productDetails', response);
        if (response.status) {
          this.productDetails = response.data;
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

  initializeHumidityChart() {
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
      const params = new HttpParams().set('sensor_id', this.filera.id_sensore).set('shipment_id', this.filera.id).set('type', type);
      this.wholeSalerService.GetChartsData(params).subscribe({
        next: (response: RequestResponse) => {
          console.log('response chart', response);
          if (response.status) {
            if (type == 'Temperature') {
              response.data.map((data: any) => {
                this.temperatures.push(+data.value);
                this.tempDates.push(data.time);
              });
              setTimeout(() => {
                if (this.temperatures.length > 0) {
                  // this.sortByDate(this.tempDates);
                  console.log('date', this.tempDates);
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
            else if(type == 'Humidity'){
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


  /*Handle Popup & Form Setup*/
  onModalClick(content: TemplateRef<any>) {
    this.modalService.open(content, this.ngbModalOptions).result.then(() => {
      this.productDetails = null;
      this.initializeChartData();
      this.filera = null;
    }).catch(() => {
      this.productDetails = null;
      this.initializeChartData();
      this.filera = null;
    });
  }
}
