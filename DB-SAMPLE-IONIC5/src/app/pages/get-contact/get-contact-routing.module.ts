import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GetContactPage } from './get-contact.page';

const routes: Routes = [
  {
    path: '',
    component: GetContactPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GetContactPageRoutingModule {}
