import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import { SupplyChainNetworkService } from 'src/app/services/supplyChainNetwork.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  returnUrl: any;
  registerForm: FormGroup | any;
  submitted = false;
  codes: any = [];
  userRole: any = localStorage.getItem('userRole');
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private supplyChainNetworkService: SupplyChainNetworkService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      // logged in so return true
      const route = this.redirectByRole(this.userRole);
      this.router.navigate([`/${route}`]);
    }

    // get return url from route parameters or default to '/filiere'
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/filiere';

    this.initializeForm('Wholesaler');

  }

  initializeForm(type: string) {
    // Form initialization
    this.registerForm = this.formBuilder.group({
      nome: ['', Validators.required],
      indirizzo: ['', Validators.required],
      cap: ['', Validators.required],
      citta: ['', Validators.required],
      stato: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      role: type !== 'Wholesaler' ? ['', Validators.required] : ['Wholesaler'],
      codice: type === 'Wholesaler' ? `W${Math.floor(100000 + Math.random() * 900000)}` : '',
      codici_filiera: type === 'Wholesaler' ? '' : [''],
      terms: [false, Validators.requiredTrue]
    });

  }

  isValid(controlName: any): boolean {
    return this.registerForm.get(controlName).invalid && this.registerForm.get(controlName).touched;
  }


  get f(): any { return this.registerForm.controls; }

  onTabChange(type: string) {
    this.submitted = false;
    this.initializeForm(type);
  }

  onAddCode() {
    const code = this.f.codici_filiera.value;
    console.log('codes', this.codes);
    console.log('code', code);
    if (code) {
      if (this.codes.includes(code) && this.codes.length > 0) {
        Swal.fire({
          icon: 'info',
          title: 'Attention!',
          text: `This supply chain code was already added.`,
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        this.spinner.show();
        this.supplyChainNetworkService.CheckSpplyChainCode(code)
          .subscribe({
            next: (res: any) => {
              console.log({ res });
              if (res.status) {
                this.codes.push(code);
                this.f.codici_filiera.setValue('');
                this.spinner.hide();
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

    } else {
      Swal.fire({
        icon: 'info',
        title: 'Attention!',
        text: 'Please add a valid supply chain code!',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }
  onRemoveCode(code: any) {
    this.codes = this.codes.filter((val: any) => val != code);
  }

  redirectByRole(role: string) {

    if (role) {
      switch (role) {
        case 'Admin':
          return 'admin/products';
        case 'Produttore':
          return 'filiere';
        case 'Trasportatore':
          return 'filiere';
        case 'Wholesaler':
          return 'wholesaler/filiera';
        default:
          return 'filiere';
        // code block
      }
    } else {
      return 'auth/login';
    }
  }

  onRegister(e: Event): void {
    e.preventDefault();

    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    if (this.f.role.value !== 'Wholesaler') {
      if (this.codes.length == 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Add at least a supply chain code!',
          showConfirmButton: false,
          timer: 3000
        });
        return;
      } else {
        this.registerForm.value.codici_filiera = this.codes;
      }
    }

    console.log('form', this.registerForm.value);
    this.spinner.show();
    this.authService.Register(this.registerForm.value)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            console.log('login', res);

            this.registerForm.reset();
            this.submitted = false;
            // localStorage.setItem('trackingLcaToken', res?.data?.token);
            // localStorage.setItem('loggedInUser', JSON.stringify(res.data));
            // localStorage.setItem('userRole', res.data?.role);
            if (this.returnUrl == '/filiere') {
              this.returnUrl = this.redirectByRole(res.data?.role);
              this.router.navigate([this.returnUrl]);
            } else {
              this.router.navigate([this.returnUrl]);
            }
            this.spinner.hide();
            this.router.navigate([this.returnUrl]);
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Account created successfully!',
              showConfirmButton: false,
              timer: 3000
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

}
