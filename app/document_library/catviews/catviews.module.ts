import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CatviewsComponent } from './catviews.component';
import { TreeTableModule } from 'ng-treetable';

const routes: Routes = [
  {path: '', component: CatviewsComponent}
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
	  TreeTableModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    CatviewsComponent
  ]
})

export class CatviewsModule {
  constructor() {
    console.log("CatviewsModule is loaded!!!")
  }
}
