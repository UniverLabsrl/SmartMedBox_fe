import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { RequestResponse } from 'src/app/models/response.model';
import { IHumidityCoefficients, IProdotti_disponibili } from 'src/app/models/spedizioni.model';
import { SpedizioniService } from 'src/app/services/spedizioni.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    centered: true,
    scrollable: true
  }

  products: IProdotti_disponibili[] = [];
  product: IProdotti_disponibili | any;
  trickProducts: any[] = [];
  productForm: FormGroup | any;
  humiditiesForm: FormGroup | any;
  humidityCoeffs: number[] = [];
  grouphumidityCoeffsForm: any = {};
  maxHCId: number = 0;
  humidityErrors: any = {};
  humidityErrorsCounter: number = 0;

  constructor(
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private spedizioniService: SpedizioniService
  ) { }

  ngOnInit(): void {
    this.getAllProducts();
    if (localStorage.getItem('TrickToken')) {
      this.spedizioniService.GetProdottisFromTrick().subscribe({
        next: (response: RequestResponse) => {
          if (response.status) {
            this.trickProducts = response.data;
            this.trickProducts.sort((a, b) => a.product_type < b.product_type ? -1 : (a.product_type > b.product_type) ? 1 : 0);
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

  searchedValue(event: any) {
    return event.target.value;
  }

  initializeProductForm(content: TemplateRef<any>, id?: number) {
    this.product = undefined;
    if (id) {
      let product = this.products.find((p: IProdotti_disponibili) => p.id === id);
      if (product) {
        this.product = product;
        if (this.product.humidity_coefficients) {
          this.product.humidity_coefficients.forEach((coeff: IHumidityCoefficients) => {
            this.addHumidityCoefficient(coeff);
          });
        } else {
          this.addHumidityCoefficient();
        }
      }
    } else {
      this.addHumidityCoefficient();
    }
    let pattern = '^-?\\d*(\\.\\d{1,})?$';
    let positive_pattern = '^\\d*(\\.\\d{1,})?$';
    this.productForm = this.formBuilder.group({
      nome_prodotto: [this.product ? this.product.nome_prodotto : undefined, Validators.required],
      // algorithm_type: [this.product ? this.product.algorithm_type : '', Validators.required],
      // reference_temperature_1: [this.product ? this.product.reference_temperature_1 : undefined, [ Validators.required, Validators.pattern(pattern) ]],
      // shelflife_rt_1: [this.product ? this.product.shelflife_rt_1 : undefined, [ Validators.required, Validators.pattern(positive_pattern) ]],
      // reference_temperature_2: [this.product ? this.product.reference_temperature_2 : undefined, Validators.pattern(pattern)],
      // shelflife_rt_2: [this.product ? this.product.shelflife_rt_2 : undefined, Validators.pattern(positive_pattern)],
      // reference_temperature_3: [this.product ? this.product.reference_temperature_3 : undefined, Validators.pattern(pattern)],
      // shelflife_rt_3: [this.product ? this.product.shelflife_rt_3 : undefined, Validators.pattern(positive_pattern)],
      // k1: [this.product ? this.product.k1 : undefined, Validators.pattern(positive_pattern)],
      // k2: [this.product ? this.product.k2 : undefined, Validators.pattern(positive_pattern)],
      // k3: [this.product ? this.product.k3 : undefined, Validators.pattern(positive_pattern)]
    });
    this.modalService.open(content, this.ngbModalOptions);
  }

  /*Form Controls*/
  get f(): any { return this.productForm.controls; }

  getAllProducts() {
    this.products = [];
    this.spedizioniService.GetProdottis().subscribe({
      next: (response: RequestResponse) => {
        if (response.status) {
          this.products = response.data;
          this.products.sort((a, b) => a.nome_prodotto < b.nome_prodotto ? -1 : (a.nome_prodotto > b.nome_prodotto) ? 1 : 0);
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

  createHumidityCoeffsControl(i: number, coeff?: IHumidityCoefficients): void {
    this.grouphumidityCoeffsForm['from_humidity_' + i] = new FormControl({ value: coeff ? coeff.from_humidity : 0, disabled: true }, [ Validators.required, Validators.pattern('^(100(\\.0{1,2})?|[1-9]?\\d(\\.\\d{1,2})?)$') ]);
    this.grouphumidityCoeffsForm['to_humidity_' + i] = new FormControl(coeff ? coeff.to_humidity : undefined, [ Validators.required, Validators.pattern('^(100(\\.0{1,2})?|[1-9]?\\d(\\.\\d{1,2})?)$') ]);
    this.grouphumidityCoeffsForm['coefficient_' + i] = new FormControl((coeff && (coeff.id != 0)) ? coeff.coefficient : undefined, [ Validators.required, Validators.pattern('^\\d*(\\.\\d{1,})?$') ]);
    this.humiditiesForm = new FormGroup(this.grouphumidityCoeffsForm);
    this.humiditiesForm.get('from_humidity_' + i).valueChanges.subscribe((_from: any) => {
      this.validateFromAndToHumidity();
    });
    this.humiditiesForm.get('to_humidity_' + i).valueChanges.subscribe((to: any) => {
      this.validateFromAndToHumidity();
      if (to && (+to != 100)) {
        if (this.humidityCoeffs.find((val: number) => val == (i + 1))) {
          this.humiditiesForm.get('from_humidity_' + (i + 1)).setValue(to);
        } else {
          const coeff: IHumidityCoefficients = { 'id': 0, 'product_id': '', 'from_humidity': to, 'to_humidity': 100, 'coefficient': 0 };
          this.addHumidityCoefficient(coeff);
        }
      }
    });
    this.humiditiesForm.get('coefficient_' + i).valueChanges.subscribe((_coeff: any) => {
      this.validateFromAndToHumidity();
    });
  }

  addHumidityCoefficient(coeff?: IHumidityCoefficients) {
    this.createHumidityCoeffsControl(this.maxHCId, coeff);
    this.humidityCoeffs.push(this.maxHCId);
    this.maxHCId += 1;
    this.validateFromAndToHumidity();
  }

  removeHumidityCoefficient(i: number) {
    this.humidityCoeffs = this.humidityCoeffs.filter((val: number) => val !== i);
    this.humiditiesForm.removeControl('from_humidity_' + i);
    this.humiditiesForm.removeControl('to_humidity_' + i);
    this.humiditiesForm.removeControl('coefficient_' + i);
    this.maxHCId -= 1;
    if (this.humiditiesForm.get('to_humidity_' + (i - 1)))
      this.humiditiesForm.get('to_humidity_' + (i - 1)).setValue(100);
    this.validateFromAndToHumidity();
  }

  validateFromAndToHumidity() {
    this.humidityErrors = {};
    this.humidityErrorsCounter = 0;
    let last_to: number = 0;
    this.humidityCoeffs.forEach((i: number) => {
      let from_humidity = this.humiditiesForm.get('from_humidity_' + i).value;
      let to_humidity = this.humiditiesForm.get('to_humidity_' + i).value;
      let coeff = this.humiditiesForm.get('coefficient_' + i).value;
      if ((from_humidity && to_humidity && (+from_humidity >= +to_humidity))) {
        this.humidityErrors['fromto_' + i] = true;
        this.humidityErrorsCounter++;
      }
      if (from_humidity && (+from_humidity < +last_to)) {
        this.humidityErrors['lessfrom_' + i] = true;
        this.humidityErrorsCounter++;
      }
      if (coeff && (+coeff <= 0)) {
        this.humidityErrors['coeffzero_' + i] = true;
        this.humidityErrorsCounter++;
      }
      last_to = to_humidity;
    });
    if (+last_to != 100) {
      this.humidityErrors['lastto'] = true;
      this.humidityErrorsCounter++;
    }
    this.humiditiesForm.updateValueAndValidity();
  }

  resetHumidityForm() {
    this.maxHCId = 0;
    this.humidityCoeffs = [];
    this.grouphumidityCoeffsForm = [];
  }

  saveProduct() {
    this.spinner.show();
    let params: any = this.productForm.value;
    params['humidity_coefficients'] = [];
    this.humidityCoeffs.forEach((i: number) => {
      if (this.humiditiesForm.get('coefficient_' + i).value)
        params['humidity_coefficients'].push({ 'from_humidity': this.humiditiesForm.get('from_humidity_' + i).value, 'to_humidity': this.humiditiesForm.get('to_humidity_' + i).value, 'coefficient': this.humiditiesForm.get('coefficient_' + i).value })
    });
    if (this.product && this.product.id) {
      this.spedizioniService.UpdateProduct(this.product.id, params).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.spinner.hide();
            this.products = this.products.filter((product: any) => product.id !== this.product.id);
            this.products.unshift(res.data);
            this.resetHumidityForm();
            this.modalService.dismissAll();
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Product updated successfully!',
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
        error: (_ee: any) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Something go wrong! Please retry, if problem persist contact administrator',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    } else {
      this.spedizioniService.CreateProduct(this.productForm.value).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.spinner.hide();
            this.products.unshift(res.data);
            this.resetHumidityForm();
            this.modalService.dismissAll();
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Product created successfully!',
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
        error: (_ee: any) => {
          this.spinner.hide();
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

  deleteProduct(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this product?',
      text: 'You cannot retrieve it!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'No',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.spedizioniService.DeleteProduct(id).subscribe({
          next: (res: any) => {
            if (res.status) {
              this.products = this.products.filter((product: any) => product.id !== id);
              this.spinner.hide();
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Product deleted successfully!',
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
          error: () => {
            this.spinner.hide();
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
    })
  }
}
