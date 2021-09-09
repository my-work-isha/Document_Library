import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { MainFormComponent } from './main-form.component';

const routes: Routes = [
  {path: '', component: MainFormComponent}
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
    MainFormComponent
  ]
})

export class MainFormModule {
  constructor() {
    console.log("MainFormModule is loaded!!!")
  }
}
