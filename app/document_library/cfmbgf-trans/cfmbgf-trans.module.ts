import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { CfmbgfTransComponent } from './cfmbgf-trans.component';

const routes: Routes = [
  {path: '', component: CfmbgfTransComponent}
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
    CfmbgfTransComponent
  ]
})

export class CfmbgfTransModule {
  constructor() {
    console.log("CfmbgfTransModule is loaded!!!")
  }
}
