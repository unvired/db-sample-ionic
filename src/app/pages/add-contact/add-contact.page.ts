import { Component, OnInit } from '@angular/core';
import { CONTACT_HEADER } from 'src/models/CONTACT_HEADER';
import { AlertController, NavController, Platform} from '@ionic/angular';
import { UnviredCordovaSDK, RequestType, ResultType, SyncResult } from '@ionic-native/unvired-cordova-sdk/ngx';
import { HomePageService } from 'src/app/services/home-page.service';
import { AppConstant } from 'src/constants/appConstants';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.page.html',
  styleUrls: ['./add-contact.page.scss'],
})
export class AddContactPage implements OnInit {
  contactHeader = new CONTACT_HEADER();

  constructor(private alertController: AlertController,
              private unviredSDK: UnviredCordovaSDK,
              private homeService: HomePageService,
              private platform: Platform,
              private navCtrl: NavController) { }

  ngOnInit() {
  }

  createContact() {
      // tslint:disable-next-line:max-line-length
      if (this.contactHeader.ContactName === undefined || this.contactHeader.ContactName.length === 0 || this.contactHeader.ContactName === '') {
         this.showAlert('', 'Enter name.');
         return;
      }

      if (this.contactHeader.Phone === undefined || this.contactHeader.Phone.length === 0 || this.contactHeader.Phone === '') {
          this.showAlert('', 'Enter Phone number.');
          return;
      }

      if (this.contactHeader.Email === undefined || this.contactHeader.Email.length === 0 || this.contactHeader.Email === undefined) {
          this.showAlert('', 'Enter Email.');
          return;
      }
      this.sendDataToServer();
  }

  async sendDataToServer() {
    console.log('Sending data to server.....');
    let inputHeader: any = {};
    inputHeader = {CONTACT_HEADER: this.contactHeader};
    const data = { CONTACT : [inputHeader]};
    console.log('INSERTING DATA TO SERVER');
    let result: SyncResult;
    if (this.platform.is('ios')) {
      result = await this.unviredSDK.syncForeground(RequestType.RQST, inputHeader, '', 'UNVIRED_DB_SAMPLE_PA_CREATE_CONTACT', true);
    } else {
      result = await this.unviredSDK.syncForeground(RequestType.RQST, '', data, 'UNVIRED_DB_SAMPLE_PA_CREATE_CONTACT', false);
    }
    console.log('***RESULT****', JSON.stringify(result));
    if (result.type === ResultType.success) {
      if (result.data.CONTACT === undefined) {
        const json = JSON.parse(result.data);
        const data3 = json.CONTACT[0].CONTACT_HEADER;
        const json1 = await this.unviredSDK.dbInsert(AppConstant.TABLE_NAME_CONTACT_HEADER, data3, true);
        console.log('Insert data to db, form browser platform ' + JSON.stringify(json1));
      } else {
        const data1 = result.data.CONTACT[0].CONTACT_HEADER;
        await this.unviredSDK.dbInsert(AppConstant.TABLE_NAME_CONTACT_HEADER, data1, true);
        this.showAlert('', 'Contact Created Successfully');
      }
    } else {
      if (result.error === '') {
        console.log('ERROR', result.message);
        this.showAlert('Error', result.message);
      } else {
        console.log('ERROR', result.error);
        this.showAlert('Error', result.error);
      }
    }
    this.homeService.sub.next('');
    this.navCtrl.pop();
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      subHeader: message,
      buttons: ['OK']
    });
    await alert.present();
  }

}
