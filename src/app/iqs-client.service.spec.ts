import { TestBed } from '@angular/core/testing';

import { IqsClientService } from './iqs-client.service';

describe('IqsClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IqsClientService = TestBed.get(IqsClientService);
    expect(service).toBeTruthy();
  });
});
