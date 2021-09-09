import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscDocumentsComponent } from './misc-documents.component';

describe('MiscDocumentsComponent', () => {
  let component: MiscDocumentsComponent;
  let fixture: ComponentFixture<MiscDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiscDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiscDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
