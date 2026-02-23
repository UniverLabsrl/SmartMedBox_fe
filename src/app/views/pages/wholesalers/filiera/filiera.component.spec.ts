import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilieraComponent } from './filiera.component';

describe('FilieraComponent', () => {
  let component: FilieraComponent;
  let fixture: ComponentFixture<FilieraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilieraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilieraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
