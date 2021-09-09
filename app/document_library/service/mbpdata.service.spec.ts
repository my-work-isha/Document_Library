import { TestBed, inject } from '@angular/core/testing';

import { MbpdataService } from './mbpdata.service';

describe('MbpdataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MbpdataService]
    });
  });

  it('should be created', inject([MbpdataService], (service: MbpdataService) => {
    expect(service).toBeTruthy();
  }));
});
