import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedKeywordComponent } from './fixed-keyword.component';

describe('FixedKeywordComponent', () => {
  let component: FixedKeywordComponent;
  let fixture: ComponentFixture<FixedKeywordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedKeywordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedKeywordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
