import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GetContact } from './get-contact';

@NgModule({
  declarations: [
    GetContact,
  ],
  imports: [
    IonicPageModule.forChild(GetContact),
  ],
})
export class GetContactModule {}
