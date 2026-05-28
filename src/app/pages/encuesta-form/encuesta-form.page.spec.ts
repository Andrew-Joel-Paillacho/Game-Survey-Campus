import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncuestaFormPage } from './encuesta-form.page';

describe('EncuestaFormPage', () => {
  let component: EncuestaFormPage;
  let fixture: ComponentFixture<EncuestaFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EncuestaFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
