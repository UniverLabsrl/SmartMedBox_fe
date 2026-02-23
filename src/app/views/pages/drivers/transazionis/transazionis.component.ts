import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { RequestResponse } from 'src/app/models/response.model';
import { TransazioniService } from 'src/app/services/transazioni.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpParams } from '@angular/common/http';
import { SupplyChainNetworkService } from 'src/app/services/supplyChainNetwork.service';
@Component({
  selector: 'app-transazionis',
  templateUrl: './transazionis.component.html',
  styleUrls: ['./transazionis.component.scss']
})
export class TransazionisComponent implements OnInit {
  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'md',
    centered: true,
    scrollable: true
  }

  // primeNg table setup
  transazionis: any = [];
  columns = ['sensor_code', 'name', 'sender', 'recipient', 'pick-up_time', 'delivery_time', 'duration', 'status'];
  Filteredcolumns = ['sensor_code', 'name', 'sender', 'destinatarioIndirizzo', 'stato']
  cols: any[] = [];
  _selectedColumns: any[] = [];
  maxDateValue = new Date();

  destinations: any[] = [];
  transaction: any;
  transactionForm: FormGroup | any;
  submitted = false;
  isDateBefore = false;
  constructor(
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private transazioniService: TransazioniService,
    private supplyChainNetworkService: SupplyChainNetworkService,
  ) { }


  ngOnInit(): void {
    this.tableConfig();
    this.getAllTransazionis();
    this.initializeForm();
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
        return { bg: '#E5B9A0', text: '#B55E0E' };
      }
      case 'Ended': {
        return { bg: '#DCFCE7', text: '#166534' };

      }
      case 'Pending': {
        return { bg: '#FEE2E2', text: '#991B1B' };
      }
      case 'Registered': {
        return { bg: '#DEEEF7', text: '#0025A9' };
      }

    }
  }

  onSelectDate() {
    let startDate: any;
    let endDate: any;

    startDate = moment(this.transaction?.data_di_carico, 'DD-MM-YYYY HH:mm');
    endDate = moment(this.f?.data_di_scarico.value, 'DD-MM-YYYY HH:mm');
    console.log(startDate);
    console.log(endDate);
    if (startDate && endDate) {
      const isDateBefore = endDate.isBefore(startDate, 'minute'); //true
      this.isDateBefore = isDateBefore;
      return isDateBefore;
    }
    this.isDateBefore = false;
    return false;
  }
  //#endregion PrimeNg Table Initialization & Setting

  //#region Form initialization & Setup

  initializeForm() {
    this.transactionForm = this.formBuilder.group({
      trasportatore: ['', Validators.required],
      data_di_scarico: [new Date(), Validators.required]
    });
  }

  /*Validate Form Control*/
  isValid(controlName: any): boolean {
    return this.transactionForm.get(controlName).invalid && this.transactionForm.get(controlName).touched;
  }

  /*Form Controls*/
  get f(): any { return this.transactionForm.controls; }

  //#endregion Form initialization & Setup

  configureTransaction(t: any) {
    t.sensor_code = t.sensor_id;
    t.product_name = t.nome_prodotto;
    t.sender = (t.type === "Internal") ? t.sender : t.destinatarioNome;
    t.recipient = (t.type === "Internal") ? t.destinatarioNome : t.nome;
    if (t.data_di_carico) {
      const [dateValues, timeValues] = t.data_di_carico.split(' ');
      const [day, month, year] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      t['pick-up_time'] = new Date(+year, +month - 1, +day, +hours, +minutes);
    }
    if (t.data_di_scarico) {
      const [dateValues, timeValues] = t.data_di_scarico.split(' ');
      const [day, month, year] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      t.delivery_time = new Date(+year, +month - 1, +day, +hours, +minutes);

      var start = moment(t.data_di_carico, 'DD-MM-YY HH:mm');
      var end = moment(t.data_di_scarico, 'DD-MM-YY HH:mm');
      // calculate total duration
      t.duration = moment.duration(end.diff(start));
      // duration in hours
      var h = parseInt(t.duration.asHours());
      // duration in minutes
      var m = parseInt(t.duration.asMinutes()) % 60;
      t.duration_string = (h > 0) ? h + ' h ' + m + ' min' : m + ' min';
    }
    t.status = t.stato;
  }

  //#region Rest API calls start

  /*Get All Transazionis*/
  getAllTransazionis() {
    this.spinner.show();
    this.transazioniService.GetTransazionis().subscribe({
      next: (response: RequestResponse) => {
        console.log('response Spedizionis', response);
        if (response.status) {
          this.transazionis = response.data;
          this.transazionis.forEach((t: any) => {
            this.configureTransaction(t);
          });
          this.transazionis.sort((a: any, b: any) => (!b.delivery_time) ? 1 : (b.delivery_time - a.delivery_time));
          this.spinner.hide();
        } else {
          this.transazionis = [];
          this.spinner.hide();
        }
      },
      error: () => {
        this.transazionis = [];
        this.spinner.hide();
      }
    })
  }

  /*Get All Transporters By NetworkOwner*/
  getTransportersByNetworkOwner(transaction: any) {
    console.log('transaction', transaction);
    this.transaction = transaction;
    if (transaction.type == 'External') {
      this.transactionForm = this.formBuilder.group({
        data_di_scarico: [new Date(), Validators.required]
      });
    }
    this.spinner.show();
    const params = new HttpParams()
      .set('id', transaction.destinatarioId)
      .set('owner', 'true');
    this.supplyChainNetworkService.GetNetworkByOwner(params).subscribe({
      next: (response: RequestResponse) => {
        console.log('response', response);
        if (response.status) {
          this.destinations = response.data;
          this.spinner.hide();
        } else {
          this.destinations = [];
          this.spinner.hide();
        }
      },
      error: () => {
        this.destinations = [];
        this.spinner.hide();
      }
    })
  }


  /*on Accept Transazioni*/
  onAccept(id: any) {

    this.spinner.show();
    const params = new HttpParams()
      .set('id', id)
      .set('data_di_carico', moment(new Date()).format('DD-MM-YYYY HH:mm'));
    this.transazioniService.AcceptTransazioni(params)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            this.spinner.hide();
            const transazionis = this.transazionis.filter((transazioni: any) => transazioni.id != id);
            this.configureTransaction(res.data);
            transazionis.unshift(res.data);
            this.transazionis = transazionis;
            this.transazionis.sort((a: any, b: any) => (!b.delivery_time) ? 1 : (b.delivery_time - a.delivery_time));
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Transaction accepted successfully!',
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
  }

  /*On Reject Transazioni*/
  onReject(id: number) {

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
        this.transazioniService.RejectTransazioni(id)
          .subscribe({
            next: (res: any) => {
              console.log({ res });
              if (res.status) {
                this.transazionis = this.transazionis.filter((transazioni: any) => transazioni.id !== id);
                this.spinner.hide();
                Swal.fire({
                  icon: 'success',
                  title: 'Rejected!',
                  text: 'Transaction rejected successfully!',
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

  onSubmit() {
    this.submitted = true;

    if (this.transactionForm.invalid || this.isDateBefore) {
      return;
    }

    this.transactionForm.value.data_di_scarico = moment(this.transactionForm.value.data_di_scarico).format('DD-MM-YYYY HH:mm');
    this.transactionForm.value.data_di_carico = moment(new Date()).format('DD-MM-YYYY HH:mm');
    console.log('form', this.transactionForm.value);
    this.spinner.show();
    this.transazioniService.AssignTransazioni(this.transactionForm.value, this.transaction.id)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            this.spinner.hide();
            this.submitted = false;
            const transazionis = this.transazionis.filter((transazioni: any) => transazioni.id != this.transaction.id);
            this.configureTransaction(res.data);
            transazionis.unshift(res.data);
            this.transazionis = transazionis;
            this.transazionis.sort((a: any, b: any) => (!b.delivery_time) ? 1 : (b.delivery_time - a.delivery_time));
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

  //#endregion Rest API calls End


  /*Handle Popup & Form Setup*/
  onModalClick(content: TemplateRef<any>) {
    this.modalService.open(content, this.ngbModalOptions).result.then(() => {
      this.initializeForm();
      this.submitted = false;
      this.transaction = null;
    }).catch(() => {
      this.initializeForm();
      this.submitted = false;
      this.transaction = null;
    });
  }
}
