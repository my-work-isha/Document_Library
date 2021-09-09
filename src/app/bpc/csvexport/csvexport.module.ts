import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular'
import { CsvexportComponent } from './csvexport.component';

const routes: Routes = [
  {path: '', component: CsvexportComponent}
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule.withComponents([]),
    RouterModule.forChild(routes)
  ],
  declarations: [CsvexportComponent]
})

export class CsvexportModule {
  constructor() {
    console.log("CsvexportModule is loaded!!!")
  }
}
