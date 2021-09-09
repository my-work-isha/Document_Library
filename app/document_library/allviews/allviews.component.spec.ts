import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllviewsComponent } from './allviews.component';

describe('AllviewsComponent', () => {
  let component: AllviewsComponent;
  let fixture: ComponentFixture<AllviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
