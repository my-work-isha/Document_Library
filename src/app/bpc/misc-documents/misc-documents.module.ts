import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { MiscDocumentsComponent } from './misc-documents.component';

const routes: Routes = [
  {path: '', component: MiscDocumentsComponent}
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
    MiscDocumentsComponent
  ]
})

export class MiscDocumentsModule {
  constructor() {
    console.log("MiscDocumentsModule is loaded!!!")
  }
}
