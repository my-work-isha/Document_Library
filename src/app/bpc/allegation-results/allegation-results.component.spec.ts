import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllegationResultsComponent } from './allegation-results.component';

describe('AllegationResultsComponent', () => {
  let component: AllegationResultsComponent;
  let fixture: ComponentFixture<AllegationResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllegationResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllegationResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
