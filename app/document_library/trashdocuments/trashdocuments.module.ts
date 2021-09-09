import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { TrashdocumentsComponent } from './trashdocuments.component';

const routes: Routes = [
  {path: '', component: TrashdocumentsComponent}
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
    TrashdocumentsComponent
  ]
})

export class TrashdocumentsModule {
  constructor() {
    console.log("TrashdocumentsModule is loaded!!!")
  }
}
