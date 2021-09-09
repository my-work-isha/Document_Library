import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { ChwTransComponent } from './chw-trans.component';

const routes: Routes = [
  {path: '', component: ChwTransComponent}
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
    ChwTransComponent
  ]
})

export class ChwTransModule {
  constructor() {
    console.log("ChwTransModule is loaded!!!")
  }
}
