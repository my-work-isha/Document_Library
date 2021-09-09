import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrashdocumentsComponent } from './trashdocuments.component';

describe('TrashdocumentsComponent', () => {
  let component: TrashdocumentsComponent;
  let fixture: ComponentFixture<TrashdocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrashdocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrashdocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
