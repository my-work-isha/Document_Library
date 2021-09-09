import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { MaintenanceViewComponent } from './maintenance-view.component';

const routes: Routes = [
  {path: '', component: MaintenanceViewComponent}
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule.withComponents([]),
    RouterModule.forChild(routes)
  ],
  declarations: [
    MaintenanceViewComponent
  ]
})

export class MaintenanceViewModule {
  constructor() {
    console.log("MaintenanceViewModule is loaded!!!")
  }
}
