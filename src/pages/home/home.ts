import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';
import { GetContact } from "../get-contact/get-contact";
import { AddContact } from "../add-contact/add-contact";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,
   public actionSheetCtrl: ActionSheetController) {

  }

  menuButtonClicked() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Get Contacts',
          handler: () => {
            console.log('Get Contacts clicked');
            this.navCtrl.push(GetContact)
          }
        }, {
          text: 'Settings',
          handler: () => {
            console.log('Settings clicked');
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    })
    actionSheet.present()
  }

  addButtonClicked() {
   this.navCtrl.push(AddContact)
  }
}
