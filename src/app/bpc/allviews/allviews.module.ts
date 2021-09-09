import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
//import { DataTablesModule } from 'angular-datatables';
import { AgGridModule } from 'ag-grid-angular';
import { AllviewsComponent } from './allviews.component';
//import { TreeTableModule } from 'ng-treetable';

const routes: Routes = [
  {path: '', component: AllviewsComponent}
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    //DataTablesModule,
    //TreeTableModule,
    AgGridModule.withComponents([]), 
    RouterModule.forChild(routes)
  ],
  declarations: [
    AllviewsComponent
  ]
})

export class AllviewsModule {
  constructor() {
    console.log("AllviewsModule is loaded!!!")
  }
}
