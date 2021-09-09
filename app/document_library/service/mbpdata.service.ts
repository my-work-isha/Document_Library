import { Injectable } from '@angular/core';
import * as _ from "lodash";

@Injectable()
export class MbpdataService {
  private mbpData: any;
  private searchStr: string = "";
  private viewPath: string;

  constructor() { }

  setMbpData(data: any) {
    this.mbpData = data;
  }
  getMbpData() {
    return this.mbpData;
  }

  setSearchStr(data: string) {
    this.searchStr = data;
  }
  getSearchStr() {
    return this.searchStr;
  }

  setViewPath(data: string) {
    this.viewPath = data;
  }
  getViewPath() {
    return this.viewPath;
  }

  // method used in main-form and all chilanyits corresponding comments fields
  validateAttachmentAndComments(attField: any, commentField: string, attDivSectionID: string): boolean {
    if(_.trim(commentField) == "" && _.trim($(attDivSectionID).text()) == "" && !(attField && attField.length > 0)) {
      return true;
    } else {
      return false;
    }
  }
}
