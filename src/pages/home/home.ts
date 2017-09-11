import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController, Events } from 'ionic-angular';
import { GetContact } from "../get-contact/get-contact";
import { AddContact } from "../add-contact/add-contact";
import { UIModel, CONTACT_HEADER } from '../../models/CONTACT_HEADER';
import { AppConstant } from '../../constants/appConstant';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private conatctHeaders: CONTACT_HEADER[] = []
  private searchResultDataSource: CONTACT_HEADER[] = []
  private UIModels: UIModel[] = []

  constructor(public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public events: Events,
    public ngZone: NgZone) {
    this.events.subscribe('didDownloadConatct', () => {
      this.getAllContactHeaders()
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.getAllContactHeaders()
  }

  getAllContactHeaders() {
    console.log("Get All Conatct Headers from DB.....")
    ump.db.select(AppConstant.TABLE_NAME_CONTACT_HEADER, "", (result) => {
      if (result.type === ump.resultType.success) {
        this.ngZone.run(() => {
          this.conatctHeaders = result.data
          this.sortContactHeader(this.conatctHeaders)
          console.log("Conatct Headers from DB:" + this.conatctHeaders.length)
        })
      }
      else {
        console.log("FAILURE:" + result.error);
      }
    })
  }

  sortContactHeader(contactHeaders: CONTACT_HEADER[]) {
    let alphabet: any = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    this.UIModels = []
    for (var letter of alphabet) {
      let letterInLowerCase = letter.toLowerCase;
      let searchLetter = letter as string

      var matches = contactHeaders.filter(contact => contact.ContactName.startsWith(searchLetter))
      if (matches.length > 0) {
        this.ngZone.run(() => {
          let uiModel = new UIModel()
          uiModel.section = letter
          matches.sort(function(a,b) {return (a.ContactName > b.ContactName) ? 1 : ((b.ContactName > a.ContactName) ? -1 : 0);} );
          uiModel.contactHeaders = matches as [CONTACT_HEADER]
          this.UIModels.push(uiModel)
        })
      }
    }
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

  filterData(ev: any) {
    // Reset items back to all of the items
    this.sortContactHeader(this.conatctHeaders)

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.searchResultDataSource = this.conatctHeaders.filter((contact) => {
        return ((contact.ContactName.toLowerCase().indexOf(val.toLowerCase()) > -1));
      })
      this.sortContactHeader(this.searchResultDataSource)
    }
  }
}
