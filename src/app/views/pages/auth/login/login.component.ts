import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  returnUrl: any;
  loginForm: FormGroup | any;
  submitted = false;
  userRole: any = localStorage.getItem('userRole');
  show = false;
  trickUrl: boolean = true;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      // logged in so return true
      const route = this.redirectByRole(this.userRole);
      this.router.navigate([`/${route}`]);

    }

    this.authService.checkTrickUrl().subscribe({
      next: (res: any) => {
        if (!res.message || (res.message == ''))
          this.trickUrl = false;
      },
      error: () => {
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
    // get return url from route parameters or default to '/filiere'
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/filiere';

    // Form initialization
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      password: ['', Validators.required]
    });
  }

  isValid(controlName: any): boolean {
    return this.loginForm.get(controlName).invalid && this.loginForm.get(controlName).touched;
  }

  get f(): any { return this.loginForm.controls; }

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

  onLogin(e: Event): void {
    e.preventDefault();

    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.spinner.show();
    this.authService.Login(this.loginForm.value)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            console.log('login', res);
            this.loginForm.reset();
            this.submitted = false;
            localStorage.setItem('SLMToken', res?.data?.token);
            localStorage.setItem('TrickToken', res?.data?.token_trick);
            localStorage.setItem('loggedInUser', JSON.stringify(res.data));
            localStorage.setItem('userRole', res.data?.role);

            this.spinner.hide();
            if (this.returnUrl == '/filiere') {
              this.returnUrl = this.redirectByRole(res.data?.role);
              this.router.navigate([this.returnUrl]);
            } else {
              this.router.navigate([this.returnUrl]);
            }
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Access successfully!',
              showConfirmButton: false,
              timer: 3000
            });
          } else {
            this.spinner.hide();
            this.submitted = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `E-mail or password not valid!`,
              showConfirmButton: false,
              timer: 3000
            });
          }
        },
        error: () => {
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
