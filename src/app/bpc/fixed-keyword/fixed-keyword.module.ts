import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { FixedKeywordComponent } from './fixed-keyword.component';

const routes: Routes = [
  {path: '', component: FixedKeywordComponent}
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    FixedKeywordComponent
  ]
})

export class FixedKeywordModule {
  constructor() {
    console.log("FixedKeywordModule is loaded!!!")
  }
}
