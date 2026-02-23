import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settingForm: FormGroup | any;
  submitted = false;
  showOld = false;
  showNew = false;
  loggedInUser: any;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') as any);
  }


  //#region Form initialization & Setup
  initializeForm() {
    this.settingForm = this.formBuilder.group({
      old_password: ['', Validators.required],
      new_password: ['', Validators.required]
    });
  }

  /*Validate Form Control*/
  isValid(controlName: any): boolean {
    return this.settingForm.get(controlName).invalid && this.settingForm.get(controlName).touched;
  }

  /*Form Controls*/
  get f(): any { return this.settingForm.controls; }

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

  /*Submit*/
  onSubmit() {
    this.submitted = true;
    if (!this.settingForm.valid) {
      return;
    }
    this.spinner.show();
    this.authService.ChangePassword(this.settingForm.value)
      .subscribe({
        next: (res: any) => {
          console.log({ res });
          if (res.status) {
            this.spinner.hide();
            this.router.navigate([this.redirectByRole(this.loggedInUser.role)]);
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Password changed successfully!',
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
              timer: 2000
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
            timer: 2000
          });
        }
      });
  }
}
