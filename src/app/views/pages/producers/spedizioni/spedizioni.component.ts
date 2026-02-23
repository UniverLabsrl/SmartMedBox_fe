import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { WizardComponent } from 'angular-archwizard';
import { NgxSpinnerService } from 'ngx-spinner';
import { RequestResponse } from 'src/app/models/response.model';
import { IProdotti_disponibili, ISpedizionis } from 'src/app/models/spedizioni.model';
import { SpedizioniService } from 'src/app/services/spedizioni.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ISupplyChainNetwork } from 'src/app/models/user.model';
import { SupplyChainNetworkService } from 'src/app/services/supplyChainNetwork.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-spedizioni',
  templateUrl: './spedizioni.component.html',
  styleUrls: ['./spedizioni.component.scss']
})
export class SpedizioniComponent implements OnInit {
  @ViewChild('wizardForm') wizardForm: WizardComponent;
  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    centered: true,
    scrollable: true
  }

  // primeNg table setup
  spedizionis: ISpedizionis[] = [];
  columns = ['name', 'product', 'batch_number', 'qty', 'production_time', 'sensor_code', 'delivery_time', 'status'];
  Filteredcolumns = ['nome', 'tipologia_di_prodotto.nome_prodotto', 'batch_number', 'qty', 'production_time', 'sensor_code', 'delivery_time', 'status'];
  cols: any[] = [];
  _selectedColumns: any[] = [];

  // Form SetUp
  productFormS1: FormGroup | any;
  productFormS2: FormGroup | any;
  transporterForm: FormGroup | any;
  submitted = false;
  formState = 'stepOne';
  prodottis: IProdotti_disponibili[];
  supplyChainNetwork: ISupplyChainNetwork[];
  trickBatches: any[] = [];
  maxDateValue = new Date();
  transporters: any = [];
  spedizioni_id: any;
  constructor(
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private spedizioniService: SpedizioniService,
    private supplyChainNetworkService: SupplyChainNetworkService,
  ) { }


  ngOnInit(): void {
    this.tableConfig();
    this.initializeProductForm();
    this.initializeTransporterForm();
    this.getAllProdottis();
    this.getAllSupplyChainNetwork();
    this.getAllSpedizionis();
    if (localStorage.getItem('TrickToken')) {
      this.spedizioniService.GetBatchesFromTrick().subscribe({
        next: (response: RequestResponse) => {
          console.log('trick batches', response);
          if (response.status) {
            this.trickBatches = response.data;
            this.trickBatches.sort((a, b) => a.productionBatchNumber < b.productionBatchNumber ? -1 : (a.productionBatchNumber > b.productionBatchNumber) ? 1 : 0);
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

  getStatusColor(status: string): any {

    switch (status) {
      case 'In Transit': {
        return { bg: '#DCFCE7', text: '#166534' };
      }
      case 'Ended': {
        return { bg: '#FEE2E2', text: '#991B1B' };
      }
      case 'Pending': {
        return { bg: '#E5B9A0', text: '#B55E0E' };
      }
      case 'Registered': {
        return { bg: '#DEEEF7', text: '#0025A9' };
      }

    }
  }

  //#endregion PrimeNg Table Initialization & Setting

  //#region Form initialization & Setup

  initializeProductForm() {
    this.productFormS1 = this.formBuilder.group({
      nome: ['', Validators.required],
      batch_number: ['', Validators.required],
      units: ['', Validators.required],
      bottle_capacity: [''],
      qty: ['', [ Validators.required, Validators.pattern('^\\d*(\\.\\d{1,})?$') ]],
      tipologia_di_prodotto: ['', Validators.required],
      tipologia_di_imballaggio: ['', Validators.required],
      id_sensore: ['', Validators.required],
      descrizione_del_prodotto: ['', Validators.required],
      status: ['Registered']
    });
    this.productFormS2 = this.formBuilder.group({
      data_di_raccolto: [new Date(), Validators.required],
      indirizzo: ['', Validators.required],
      cap: ['', Validators.required],
      citta: ['', Validators.required],
      stato: ['', Validators.required],
      destinatario: ['', Validators.required],
      temperatura_media: ['', Validators.required]
    });

    this.productFormS1.get('batch_number').valueChanges.subscribe((batch_number: string) => {
      let batch = this.trickBatches.find(b => b.productionBatchNumber == batch_number);
      if (batch) {
        this.productFormS1.patchValue({ 'units': batch.unitOfMeasure, 'bottle_capacity': batch.bottleCapacity, 'qty': batch.quantity, 'tipologia_di_prodotto': batch.typeOfProduct, 'tipologia_di_imballaggio': batch.typeOfPackaging, 'descrizione_del_prodotto': batch.productDescription });
        this.productFormS2.patchValue({ 'data_di_raccolto': batch.productionCollectionDate, 'indirizzo': batch.recipientAddress, 'cap': batch.recipientPostalCode, 'citta': batch.recipientCity, 'stato': batch.recipientState });
      }
      this.productFormS1.updateValueAndValidity();
    });
    this.productFormS1.get('units').valueChanges.subscribe((units: string) => {
      if (units == 'Bottles') {
        this.productFormS1.controls['bottle_capacity'].addValidators([ Validators.required, Validators.pattern('^\\d*(\\.\\d{1,})?$') ]);
      } else {
        this.productFormS1.patchValue({ 'bottle_capacity': '' });
        this.productFormS1.controls['bottle_capacity'].clearValidators();
        this.productFormS1.controls['bottle_capacity'].updateValueAndValidity();
      }
      this.productFormS1.updateValueAndValidity();
    });
  }

  initializeTransporterForm() {
    this.transporterForm = this.formBuilder.group({
      trasportatore: ['', Validators.required],
      type: ['create', Validators.required]
    });
  }

  /*Validate Form Control*/
  isValid(controlName: any, form: any): boolean {
    if (form === 'productFormS1') {
      return this.productFormS1.get(controlName).invalid && this.productFormS1.get(controlName).touched;
    } else if (form === 'productFormS2') {
      return this.productFormS2.get(controlName).invalid && this.productFormS2.get(controlName).touched;
    } else {
      return this.transporterForm.get(controlName).invalid && this.transporterForm.get(controlName).touched;
    }
  }

  /*Form Controls*/
  get f(): any { return this.productFormS1.controls; }
  get f2(): any { return this.productFormS2.controls; }
  get Tf(): any { return this.transporterForm.controls; }

  onStepNext(current: string, next: string) {
    console.log({ current, next });
    if (current === 'stepOne') {
      this.submitted = true;
      if (this.productFormS1.invalid) {
        return;
      }
      console.log('form', this.productFormS1.value);
      this.submitted = false;
    } else if (current === 'stepTwo') {
      this.submitted = true;
      if (this.productFormS2.invalid) {
        return;
      }
      this.productFormS2.value.data_di_raccolto = moment(this.productFormS2.value.data_di_raccolto).format('DD-MM-YYYY HH:mm')
      this.productFormS1.value = { ...this.productFormS1.value, ...this.productFormS2.value };
      console.log('form2', this.productFormS2.value);
      console.log('form1', this.productFormS1.value);
      this.submitted = false;
      this.onCreateSpedizioni();
    }
    this.formState = next;
    document.getElementById(current)?.click();

  }

  onStepBack(current: string, back: string) {
    this.formState = back;
    document.getElementById(current)?.click();
  }

  configureShipment(s: ISpedizionis) {
    s.name = s.nome;
    if (s.tipologia_di_prodotto)
      s.product = s.tipologia_di_prodotto.nome_prodotto;
    s.qty = +s.qty;
    s.sensor_code = s.id_sensore;
    if (s.data_di_raccolto) {
      const [dateValues, timeValues] = s.data_di_raccolto.split(' ');
      const [day, month, year] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      s.harvest_time = new Date(+year, +month - 1, +day, +hours, +minutes);
    }
    if (s.transactions && (s.transactions.length > 0) && s.transactions[0].data_di_carico) {
      s.delivery_time_string = s.transactions[0].data_di_carico;
      const [dateValues, timeValues] = s.delivery_time_string.split(' ');
      const [day, month, year] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      s.delivery_time = new Date(+year, +month - 1, +day, +hours, +minutes);
    }
  }
  //#endregion Form initialization & Setup

  //#region Rest API calls start

  /*Get All Spedizionis*/
  getAllSpedizionis() {
    this.spinner.show();
    this.spedizioniService.GetSpedizionis().subscribe({
      next: (response: RequestResponse) => {
        console.log('response Spedizionis', response);
        if (response.status) {
          this.spedizionis = response.data;
          this.spedizionis.forEach((s: ISpedizionis) => {
            this.configureShipment(s);
          });
          this.spedizionis.sort((a, b) => a.delivery_time < b.delivery_time ? 1 : (a.delivery_time > b.delivery_time) ? -1 : 0);
          this.spinner.hide();
        } else {
          this.spedizionis = [];
          this.spinner.hide();
        }
      },
      error: () => {
        this.spedizionis = [];
        this.spinner.hide();
      }
    })
  }

  /*Get All Transporters By NetworkOwner*/
  getTransportersByNetworkOwner(spedizioni: any) {
    this.spedizioni_id = spedizioni.id;
    this.spinner.show();
    const params = new HttpParams()
      .set('id', spedizioni.destinatario.network_owner)
      .set('owner', 'false');
    this.supplyChainNetworkService.GetNetworkByOwner(params).subscribe({
      next: (response: RequestResponse) => {
        console.log('response', response);
        if (response.status) {
          this.transporters = response.data;
          if (spedizioni.assigned_driver) {
            this.transporterForm.setValue({
              trasportatore: spedizioni.assigned_driver,
              type: 'edit'
            });
          }
          this.spinner.hide();
        } else {
          this.transporters = [];
          this.spinner.hide();
        }
      },
      error: () => {
        this.transporters = [];
        this.spinner.hide();
      }
    })
  }

  /*Get All Prodottis*/
  getAllProdottis() {
    this.spedizioniService.GetProdottis().subscribe({
      next: (response: RequestResponse) => {
        console.log('response', response);
        if (response.status) {
          this.prodottis = response.data;
        } else {
          this.prodottis = [];
        }
      },
      error: () => {
        this.prodottis = [];
      }
    })
  }

  /*Get All SupplyChainNetwork*/
  getAllSupplyChainNetwork() {
    this.supplyChainNetworkService.GetNetworkByStatus('Active').subscribe({
      next: (response: RequestResponse) => {
        console.log('response Network', response);
        if (response.status) {
          this.supplyChainNetwork = response.data;
        } else {
          this.supplyChainNetwork = [];
        }
      },
      error: () => {
        this.supplyChainNetwork = [];
      }
    })
  }

  /*Creat Spedizioni*/
  onCreateSpedizioni() {
    this.spinner.show();
    this.spedizioniService.CreateSpedizioni(this.productFormS1.value)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            this.spinner.hide();
            this.submitted = false;
            this.configureShipment(res.data);
            this.spedizionis.unshift(res.data);
            this.spedizionis.sort((a, b) => a.delivery_time < b.delivery_time ? 1 : (a.delivery_time > b.delivery_time) ? -1 : 0);
            document.getElementById('closeModal')?.click();
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Shipment created successfully!',
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
        error: (ee: any) => {
          console.log('ee', ee);
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

  /*Assign Transporter*/
  onAssignTransporter() {
    this.submitted = false;
    if (this.transporterForm.invalid) {
      return;
    }
    this.transporterForm.value.spedizioni_id = this.spedizioni_id;
    console.log('transporter Form', this.transporterForm.value);
    this.spinner.show();
    this.spedizioniService.AssignTransporter(this.transporterForm.value)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            this.spinner.hide();
            this.submitted = false;
            const spedizionis = this.spedizionis.filter((spedizioni: any) => spedizioni.id != this.spedizioni_id);
            this.configureShipment(res.data);
            spedizionis.unshift(res.data);
            this.spedizionis = spedizionis;
            document.getElementById('closeModal')?.click();
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Transporter assigned successfully!',
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
        error: (ee: any) => {
          console.log('ee', ee);
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

  /*On DeleteSpedizioni*/
  onDeleteSpedizioni(id: number) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'You cannot restore it!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.spedizioniService.DeleteSpedizioni(id)
          .subscribe({
            next: (res: any) => {
              console.log({ res });
              if (res.status) {
                this.spedizionis = this.spedizionis.filter((spedizioni: any) => spedizioni.id !== id);
                this.spinner.hide();
                Swal.fire({
                  icon: 'success',
                  title: 'Deleted!',
                  text: 'Shipment deleted successfully!',
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
                  timer: 2000
                });
              }
            },
            error: () => {
              this.spinner.hide();
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Something go wrong! Please retry, if problem persist contact administrator`,
                showConfirmButton: false,
                timer: 2000
              });
            }
          });
      }
    })
  }
  //#endregion Rest API calls End 

  /*Handle Popup & Form Setup*/
  onModalClick(content: TemplateRef<any>) {
    this.modalService.open(content, this.ngbModalOptions).result.then(() => {
      this.initializeTransporterForm();
      this.initializeProductForm();
      this.formState = 'stepOne';
      this.submitted = false;
      this.transporters = [];
    }).catch(() => {
      this.initializeTransporterForm();
      this.initializeProductForm();
      this.formState = 'stepOne';
      this.submitted = false;
      this.transporters = [];
    });
  }
}
