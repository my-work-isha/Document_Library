import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChwswgTransComponent } from './chwswg-trans.component';

describe('ChwswgTransComponent', () => {
  let component: ChwswgTransComponent;
  let fixture: ComponentFixture<ChwswgTransComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChwswgTransComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChwswgTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
