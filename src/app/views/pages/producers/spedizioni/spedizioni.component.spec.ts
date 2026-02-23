import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpedizioniComponent } from './spedizioni.component';

describe('SpedizioniComponent', () => {
  let component: SpedizioniComponent;
  let fixture: ComponentFixture<SpedizioniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpedizioniComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpedizioniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
