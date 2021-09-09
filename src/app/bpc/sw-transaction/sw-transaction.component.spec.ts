import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwTransactionComponent } from './sw-transaction.component';

describe('SwTransactionComponent', () => {
  let component: SwTransactionComponent;
  let fixture: ComponentFixture<SwTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
