import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbCollapseModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { FeahterIconModule } from 'src/app/core/feather-icon/feather-icon.module';
import { HttpClientModule } from '@angular/common/http';
import { NgxMaskModule } from 'ngx-mask';
import { ColorPickerModule } from 'ngx-color-picker';
import { ArchwizardModule } from 'angular-archwizard';
import { NgxSpinnerModule } from "ngx-spinner";
import { SplitPipe } from 'src/app/pipes/split.pipe';
import { NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
// import { CustomAdapter, CustomDateParserFormatter } from 'src/app/services/customDateAdapter.service';
import { NgSelectModule } from '@ng-select/ng-select';
// import { ClipboardModule } from '@angular/cdk/clipboard';
import { ClipboardModule } from 'ngx-clipboard';
@NgModule({
  declarations: [
    SplitPipe,
  ],
  imports: [
    CommonModule,
    NgxDatatableModule,
    // FeahterIconModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbDatepickerModule,
    NgbModule,
    ClipboardModule,
    NgSelectModule,
    ColorPickerModule,
    ArchwizardModule,
    NgxSpinnerModule,
    NgxMaskModule.forRoot({ validation: true }), // Ngx-mask
  ],
  exports: [
    NgxDatatableModule,
    // FeahterIconModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbDatepickerModule,
    NgbModule,
    ClipboardModule,
    NgSelectModule,
    NgxMaskModule,
    ColorPickerModule,
    ArchwizardModule,
    NgxSpinnerModule,
    SplitPipe,

  ],
  providers: [
    // { provide: NgbDateAdapter, useClass: CustomAdapter },
    // { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ],
})
export class SharedModule { }
