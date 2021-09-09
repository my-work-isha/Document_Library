import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { ProfileFormComponent } from './profile-form.component';

const routes: Routes = [
  {path: '', component: ProfileFormComponent}
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
    ProfileFormComponent
  ]
})

export class ProfileFormModule {
  constructor() {
    console.log("ProfileFormModule is loaded!!!")
  }
}
