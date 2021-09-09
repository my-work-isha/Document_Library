import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { ChwswgTransComponent } from './chwswg-trans.component';

const routes: Routes = [
  {path: '', component: ChwswgTransComponent}
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
    ChwswgTransComponent
  ]
})

export class ChwswgTransModule {
  constructor() {
    console.log("ChwswgTransModule is loaded!!!")
  }
}
