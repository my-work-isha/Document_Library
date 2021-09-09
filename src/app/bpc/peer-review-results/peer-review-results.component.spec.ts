import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerReviewResultsComponent } from './peer-review-results.component';

describe('PeerReviewResultsComponent', () => {
  let component: PeerReviewResultsComponent;
  let fixture: ComponentFixture<PeerReviewResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeerReviewResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeerReviewResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
