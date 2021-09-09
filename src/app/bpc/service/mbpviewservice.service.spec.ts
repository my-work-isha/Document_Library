import { TestBed, inject } from '@angular/core/testing';

import { MbpviewserviceService } from './mbpviewservice.service';

describe('MbpviewserviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MbpviewserviceService]
    });
  });

  it('should be created', inject([MbpviewserviceService], (service: MbpviewserviceService) => {
    expect(service).toBeTruthy();
  }));
});
