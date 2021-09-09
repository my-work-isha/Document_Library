import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { ItsmtsTransComponent } from './itsmts-trans.component';

const routes: Routes = [
  {path: '', component: ItsmtsTransComponent}
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
    ItsmtsTransComponent
  ]
})

export class ItsmtsTransModule {
  constructor() {
    console.log("ItsmtsTransModule is loaded!!!")
  }
}
