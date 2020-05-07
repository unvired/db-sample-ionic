import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GetContactPageRoutingModule } from './get-contact-routing.module';

import { GetContactPage } from './get-contact.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GetContactPageRoutingModule
  ],
  declarations: [GetContactPage]
})
export class GetContactPageModule {}
