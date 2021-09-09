import { TestBed, inject } from '@angular/core/testing';

import { ViewdetailsService } from './viewdetails.service';

describe('ViewdetailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewdetailsService]
    });
  });

  it('should be created', inject([ViewdetailsService], (service: ViewdetailsService) => {
    expect(service).toBeTruthy();
  }));
});
