import { Component, OnInit, NgZone } from '@angular/core';
import { CONTACT_HEADER, UIModel } from 'src/models/CONTACT_HEADER';
import { AlertController, Platform, LoadingController, NavController } from '@ionic/angular';
import { AppConstant } from '../../../constants/appConstants';
import { UnviredCordovaSDK, RequestType, ResultType, SyncResult } from '@ionic-native/unvired-cordova-sdk/ngx';
import { HomePageService } from 'src/app/services/home-page.service';

@Component({
  selector: 'app-get-contact',
  templateUrl: './get-contact.page.html',
  styleUrls: ['./get-contact.page.scss'],
})
export class GetContactPage implements OnInit {
  contactHeader = new CONTACT_HEADER();
  private downloadedConatctHeaders: CONTACT_HEADER[] = [];
  UIModels: UIModel[] = [];

  constructor(public alertCtrl: AlertController,
              private navCtrl: NavController,
              private ngZone: NgZone,
              private platform: Platform,
              private unviredSDK: UnviredCordovaSDK,
              private homeService: HomePageService,
              private loadingController: LoadingController) { }

  ngOnInit() {
  }

  getContact() {
    if (this.contactHeader.ContactId === undefined) {
      this.showAlert('', 'Enter Contact id');
    } else if (this.contactHeader.ContactName === undefined) {
      this.showAlert('', 'Enter Contact name');
    } else {
      this.sendDataToServer();
    }
  }

  async sendDataToServer() {
    this.showLoader();
    this.downloadedConatctHeaders = [];

    let inputHeader = {};
    inputHeader = {CONTACT_HEADER: this.contactHeader};

    const data = { CONTACT : [inputHeader]};
    let result: SyncResult;

    if (this.platform.is('ios') || this.platform.is('android')) {
      result = await this.unviredSDK.syncForeground(RequestType.RQST, inputHeader, '', AppConstant.PA_GET_CONTACT, true);
    } else {
      result = await this.unviredSDK.syncForeground(RequestType.RQST, '', data, AppConstant.PA_GET_CONTACT, true);
      console.log('REsult from server ' + JSON.stringify(result));
    }
    if (result.type === ResultType.success) {

      const jsonObj = result.data;
      let contactObj = jsonObj.CONTACT;

      if (contactObj === undefined) {
        // tslint:disable-next-line:max-line-length
        const result1 = await this.unviredSDK.dbSelect(AppConstant.TABLE_NAME_CONTACT_HEADER, `ContactId = '${this.contactHeader.ContactId}'`);
        console.log('Response from Database: ' + JSON.stringify(result1));
        this.hideLoader();
        this.showAlert('', 'Contact downloaded');
        contactObj = result1.data;
        let count = contactObj.length;
        // contactObj = contactObj[0].CONTACT_HEADER;
        const contactHeader = new CONTACT_HEADER();
        contactHeader.ContactId = contactObj[0].ContactId;
        contactHeader.ContactName = contactObj[0].ContactName;
        contactHeader.Phone = contactObj[0].Phone;
        contactHeader.Email = contactObj[0].Email;
        this.downloadedConatctHeaders.push(contactHeader);

        count = count - 1;
        if (count === 0) {
            this.sortContactHeader(this.downloadedConatctHeaders);
          }
      } else if (contactObj.length === 0) {
        this.hideLoader();
        this.showAlert('', 'Provide proper contact id.');
      } else {
        let count = contactObj.length;
        contactObj = contactObj[0].CONTACT_HEADER;
        const contactHeader = new CONTACT_HEADER();
        contactHeader.ContactId = contactObj.ContactId;
        contactHeader.ContactName = contactObj.ContactName;
        contactHeader.Phone = contactObj.Phone;
        contactHeader.Email = contactObj.Email;
        this.downloadedConatctHeaders.push(contactHeader);

        count = count - 1;
        if (count === 0) {
            this.sortContactHeader(this.downloadedConatctHeaders);
          }
      }
    } else {
      if (result.message.length > 0) {
        this.hideLoader();
        this.showAlert('', result.message);
      } else if (result.error.length > 0) {
        this.hideLoader();
        this.showAlert('Error', result.error);
      }
    }
  }

  sortContactHeader(contactHeaders: CONTACT_HEADER[]) {
    const alphabet: any = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    this.UIModels = [];
    for (const letter of alphabet) {
      const letterInLowerCase = letter.toLowerCase;
      const searchLetter = letter as string;

      const matches = contactHeaders.filter(contact => contact.ContactName.startsWith(searchLetter));
      if (matches.length > 0) {
        this.ngZone.run(() => {
          const uiModel = new UIModel();
          uiModel.section = letter;
          // tslint:disable-next-line:only-arrow-functions
          matches.sort(function(a, b) { return (a.ContactName > b.ContactName) ? 1 : ((b.ContactName > a.ContactName) ? -1 : 0); });
          uiModel.contactHeaders = matches as [CONTACT_HEADER];
          this.hideLoader();
          this.UIModels.push(uiModel);
        });
      }
    }
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showAlertOnBackClick() {
    if (this.downloadedConatctHeaders.length > 0) {
      const alert = await this.alertCtrl.create({
        header: '',
        subHeader: 'Do you want to save results?',
        buttons: [{
          text: 'Yes',
          handler: async () => {
              // tslint:disable-next-line:max-line-length
              const result = await this.unviredSDK.dbSelect(AppConstant.TABLE_NAME_CONTACT_HEADER, `ContactId = '${this.contactHeader.ContactId}'`);
              console.log('Data from db ' + JSON.stringify(result));
              // tslint:disable-next-line:max-line-length
              const rst = await this.unviredSDK.dbDelete(AppConstant.TABLE_NAME_CONTACT_HEADER, `ContactId = '${this.contactHeader.ContactId}'`);
              console.log('Deleted records ' + JSON.stringify(rst));
              if (rst.type === ResultType.success) {
                this.saveHeadersToDB();
              } else {
                console.log('Failure: ' + JSON.stringify(rst));
                this.navCtrl.pop();
              }
          }
        }, {
          text: 'No',
          handler: () => {
            this.navCtrl.pop();
          }
        }]
      });
      await alert.present();
    } else {
      this.navCtrl.pop();
    }

  }

  async saveHeadersToDB() {
    let count = this.downloadedConatctHeaders.length;
    for (const contact of this.downloadedConatctHeaders) {
      const insertRst = await this.unviredSDK.dbInsertOrUpdate(AppConstant.TABLE_NAME_CONTACT_HEADER, contact, true);
      if (insertRst.type === ResultType.success) {
        console.log('Added Contact Header Successfully :' + JSON.stringify(insertRst));
        count = count - 1;
        if (count === 0) {
          this.homeService.sub.next('');
          this.navCtrl.pop();
        }
      } else {
        console.log('Failure: ' + JSON.stringify(insertRst));
        count = count - 1;
        if (count === 0) {
          this.homeService.sub.next('');
          this.navCtrl.pop();
        }
      }
    }
  }

showLoader() {
    this.loadingController.create({
      message: 'Please wait...'
    }).then((res) => {
      res.present();
    });
  }

hideLoader() {
    this.loadingController.dismiss().then((res) => {
      console.log('Loading dismissed!', res);
    }).catch((error) => {
      console.log('error', error);
    });
  }
}
