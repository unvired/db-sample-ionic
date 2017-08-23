import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddContact } from './add-contact';

@NgModule({
  declarations: [
    AddContact,
  ],
  imports: [
    IonicPageModule.forChild(AddContact),
  ],
})
export class AddContactModule {}
