import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';

@Injectable()
export class KeywordsService {
  Fixedkeywords = [];
  retrieveProfile = [];
  countryMasterValues = [];

  constructor(private http: Http) { }

  getFixedkeywords() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    return this.http.get('/api/fixedkeywords',options);
  }
  setFixedkeywords(values: string[]) {
    this.Fixedkeywords = values;
  }

  
getCountrymaster() {
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  let options = new RequestOptions({ headers: headers });
  return this.http.get('/api/countrymaster', options);
  }
  setCountrymaster(values: string[]) {
  this.countryMasterValues = values;
  } 
  
  getretrieveProfile() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    return this.http.get('/api/retrieveProfile',options);
  }
  setretrieveProfile(values: string[]) {
    this.retrieveProfile = values;
  }
}
