import { Component, OnInit, ViewChild, ElementRef, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  loggedInUser: any;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') as any);
  }

  /**
   * Sidebar toggle on hamburger button click
   */
  toggleSidebar(e: Event) {
    e.preventDefault();
    this.document.body.classList.toggle('sidebar-open');
  }

  /**
   * Logout
   */
  onLogout(e: Event) {
    e.preventDefault();
    this.spinner.show();

    this.authService.Logout()
      .subscribe({
        next: () => {
          localStorage.removeItem('SLMToken');
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('userRole');
          this.spinner.hide();
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          localStorage.removeItem('SLMToken');
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('userRole');
          this.spinner.hide();
          this.router.navigate(['/auth/login']);
        }
      });
  }

}
