import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { PeerReviewResultsComponent } from './peer-review-results.component';

const routes: Routes = [
  {path: '', component: PeerReviewResultsComponent}
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
    PeerReviewResultsComponent
  ]
})

export class PeerReviewResultsModule {
  constructor() {
    console.log("PeerReviewResultsModule is loaded!!!")
  }
}
