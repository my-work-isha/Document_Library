import { TestBed, inject } from '@angular/core/testing';

import { KeywordsService } from './keywords.service';

describe('KeywordsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeywordsService]
    });
  });

  it('should be created', inject([KeywordsService], (service: KeywordsService) => {
    expect(service).toBeTruthy();
  }));
});
