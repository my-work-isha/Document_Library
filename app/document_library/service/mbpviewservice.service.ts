import { Injectable } from '@angular/core';

@Injectable()
export class MbpviewserviceService {

  private mbpData:any;

  constructor() { }

  setMbpData(data:any){
    this.mbpData=data;
  }
  getMbpData()
  {
    return this.mbpData;
  }
}
