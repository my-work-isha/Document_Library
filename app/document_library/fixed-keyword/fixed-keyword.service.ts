import{Injectable} from '@angular/core';
import{Http,Response} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()

export class fixedkeywordservice{

    private _url:string="api/fixedkeywords"
    constructor(private _http:Http){}
    getfixedkeyword(){
        return this._http.get(this._url)
            .map((response:Response) => response.json());
    }
}