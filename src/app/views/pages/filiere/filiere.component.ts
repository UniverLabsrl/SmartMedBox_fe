import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { RequestResponse } from 'src/app/models/response.model';
import { SupplyChainNetworkService } from 'src/app/services/supplyChainNetwork.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-filiere',
  templateUrl: './filiere.component.html',
  styleUrls: ['./filiere.component.scss']
})
export class FiliereComponent implements OnInit {
  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'md',
    centered: true,
    scrollable: true
  }

  filiere: any = [];
  columns = ['name', 'email', 'code', 'date_of_addition', 'date_of_elimination', 'status'];
  Filteredcolumns = ['network_owner.nome', 'network_owner.email', 'network_owner.codice', 'created_at', 'updated_at', 'status'];
  cols: any[] = [];
  _selectedColumns: any[] = [];

  addNetworkForm: FormGroup | any;
  submitted = false;

  constructor(
    private modalService: NgbModal,
    private supplyChainNetworkService: SupplyChainNetworkService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
  ) { }


  ngOnInit(): void {
    this.tableConfig();
    this.getAll();
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

  //#endregion PrimeNg Table Initialization & Setting

  //#region Form initialization & Setup

  initializeForm() {
    this.addNetworkForm = this.formBuilder.group({
      codice: ['', Validators.required]
    });
  }

  /*Validate Form Control*/
  isValid(controlName: any): boolean {
    return this.addNetworkForm.get(controlName).invalid && this.addNetworkForm.get(controlName).touched;
  }

  /*Form Controls*/
  get f(): any { return this.addNetworkForm.controls; }
  //#endregion Form initialization & Setup

  configureSupplyChainNetwork(f: any) {
    if (f.network_owner) {
      f.name = f.network_owner.nome;
      f.email = f.network_owner.email;
      f.code = f.network_owner.codice;
    }
    if (f.created_at) {
      const [dateValues, timeValues] = f.created_at.split('T');
      const [year, month, day] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      f.date_of_addition = new Date(+year, +month - 1, +day, +hours, +minutes);
    }
    if ((f.status == 'Not Active') && f.updated_at) {
      const [dateValues, timeValues] = f.updated_at.split('T');
      const [year, month, day] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      f.date_of_elimination = new Date(+year, +month - 1, +day, +hours, +minutes);
    }
  }

  //#region Rest API calls start

  /*Get All*/
  getAll() {
    this.spinner.show();
    this.supplyChainNetworkService.GetSupplyChainNetwork().subscribe({
      next: (response: RequestResponse) => {
        console.log('response', response);
        if (response.status) {
          this.filiere = response.data;
          this.filiere.forEach((f: any) => {
            this.configureSupplyChainNetwork(f);
          });
          this.filiere.sort((a: any, b: any) => a.name < b.name ? -1 : (a.name > b.name) ? 1 : 0);
          this.spinner.hide();
        } else {
          this.filiere = [];
          this.spinner.hide();
        }
      },
      error: () => {
        this.filiere = [];
        this.spinner.hide();
      }
    })
  }

  onAddSuppyChainCode() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.addNetworkForm.invalid) {
      return;
    }
    this.spinner.show();
    this.supplyChainNetworkService.AddSupplyChainCode(this.addNetworkForm.value)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            this.spinner.hide();
            this.submitted = false;
            this.configureSupplyChainNetwork(res.data);
            console.log(this.filiere);
            this.filiere.unshift(res.data);
            console.log(this.filiere);
            this.filiere.sort((a: any, b: any) => a.name < b.name ? -1 : (a.name > b.name) ? 1 : 0);
            document.getElementById('closeModal')?.click();
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Supply chain code created successfully!',
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

  /*On Deactivate*/
  onDeactivate(id: number) {

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
        this.supplyChainNetworkService.DeactivateSpplyChainNetwork(id)
          .subscribe({
            next: (res: any) => {
              console.log({ res });
              if (res.status) {
                const filiere = this.filiere.filter((filere: any) => filere.id !== id);
                filiere.unshift(res.data);
                this.filiere = filiere;
                this.spinner.hide();
                Swal.fire({
                  icon: 'success',
                  title: 'Deleted!',
                  text: 'Supply chain deleted successfully!',
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
      this.initializeForm();
      this.submitted = false;
    }).catch(() => {
      this.initializeForm();
      this.submitted = false;
    });
  }
}
