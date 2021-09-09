import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { AllegationResultsComponent } from './allegation-results.component';

const routes: Routes = [
  {path: '', component: AllegationResultsComponent}
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
    AllegationResultsComponent
  ]
})

export class AllegationResultsModule {
  constructor() {
    console.log("AllegationResultsModule is loaded!!!")
  }
}
