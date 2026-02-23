import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransazionisComponent } from './transazionis.component';

describe('TransazionisComponent', () => {
  let component: TransazionisComponent;
  let fixture: ComponentFixture<TransazionisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransazionisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransazionisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
