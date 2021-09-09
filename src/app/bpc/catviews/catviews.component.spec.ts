import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatviewsComponent } from './catviews.component';

describe('CatviewsComponent', () => {
  let component: CatviewsComponent;
  let fixture: ComponentFixture<CatviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
