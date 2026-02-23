import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPassForm: FormGroup | any;
  submitted = false;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    // Form initialization
    this.forgotPassForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]]
    });
  }

  isValid(controlName: any): boolean {
    return this.forgotPassForm.get(controlName).invalid && this.forgotPassForm.get(controlName).touched;
  }

  get f(): any { return this.forgotPassForm.controls; }

  onForgotPass(e: Event): void {
    e.preventDefault();

    this.submitted = true;
    // stop here if form is invalid
    if (this.forgotPassForm.invalid) {
      return;
    }
    // show spinner
    this.spinner.show();

    this.authService.ForgotPassword(this.forgotPassForm.value)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            console.log('login', res);
            this.forgotPassForm.reset();
            this.submitted = false;
            this.spinner.hide();
            this.router.navigate(['/auth/login']);
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'A new password has been sent to your email!',
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
        error: (error: any) => {
          console.log('error', error);
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
