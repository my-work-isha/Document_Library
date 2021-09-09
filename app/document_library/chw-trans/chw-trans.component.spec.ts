import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChwTransComponent } from './chw-trans.component';

describe('ChwTransComponent', () => {
  let component: ChwTransComponent;
  let fixture: ComponentFixture<ChwTransComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChwTransComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChwTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
