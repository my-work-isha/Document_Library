import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CfmbgfTransComponent } from './cfmbgf-trans.component';
//unit test case for cfm bgf form
describe('CfmbgfTransComponent', () => {
  let component: CfmbgfTransComponent;
  let fixture: ComponentFixture<CfmbgfTransComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CfmbgfTransComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CfmbgfTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
