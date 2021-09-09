import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { SwTransactionComponent } from './sw-transaction.component';

const routes: Routes = [
  {path: '', component: SwTransactionComponent}
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
    SwTransactionComponent
  ]
})

export class SwTransactionModule {
  constructor() {
    console.log("SwTransactionModule is loaded!!!")
  }
}
