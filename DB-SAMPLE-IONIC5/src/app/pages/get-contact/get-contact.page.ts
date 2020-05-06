import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CONTACT_HEADER, UIModel } from 'src/models/CONTACT_HEADER';
import { AlertController, Platform, LoadingController } from '@ionic/angular';
import { AppConstant } from '../../../constants/appConstants';
import { UnviredCordovaSDK, RequestType, ResultType } from '@ionic-native/unvired-cordova-sdk/ngx';

@Component({
  selector: 'app-get-contact',
  templateUrl: './get-contact.page.html',
  styleUrls: ['./get-contact.page.scss'],
})
export class GetContactPage implements OnInit {
  private contactHeader = new CONTACT_HEADER();
  private downloadedConatctHeaders: CONTACT_HEADER[] = [];
  private UIModels: UIModel[] = [];

  constructor(private router: Router,
              public alertCtrl: AlertController,
              private ngZone: NgZone,
              private unviredSDK: UnviredCordovaSDK,
              private platform: Platform,
              private loadingController: LoadingController) { }

  ngOnInit() {
  }

  goToHome(){
    this.router.navigate(['/home']);
  }

  getContact(){
    if(this.contactHeader.ContactId == undefined){
      this.showAlert("","Enter Contact id");
    }else if(this.contactHeader.ContactName == undefined){
      this.showAlert("","Enter Contact name");
    } else {
      this.sendDataToServer();
    }
  }

  async sendDataToServer(){

    this.showLoader();

    this.downloadedConatctHeaders = []

    var inputHeader = {}
    inputHeader["CONTACT_HEADER"] = this.contactHeader;

    const data = { CONTACT : [inputHeader]};

    if(this.platform.is('ios')||this.platform.is('android')){

      this.unviredSDK.syncForeground(RequestType.RQST, '', data, AppConstant.PA_GET_CONTACT, true)
      .then((result)=>{
        console.log("FOREGROUND INPUT",JSON.stringify(result));
      })
      .catch((error)=>{
        console.log("FOREGROUND ERROR",error);
      })

    }else{
      
      await this.unviredSDK.syncForeground(RequestType.RQST, '', data, AppConstant.PA_GET_CONTACT, true);
       
    }
    const  result = await this.unviredSDK.dbSelect(AppConstant.TABLE_NAME_CONTACT_HEADER, `ContactId= '${this.contactHeader.ContactId}'`);
    console.log('Fted data from db',result);

    console.log("Response from server: " + JSON.stringify(result))
    if (result.type === ResultType.success) {

      let jsonObj = result.data;
      let contactObj = jsonObj;

      if (contactObj == undefined) {
        this.hideLoader();
        this.showAlert("", "Contact doesn't exist.")
      }
      if(contactObj.length == 0){
        this.hideLoader();
        this.showAlert("", "Provide proper contact id.")
      }else{
        var count = contactObj.length
        contactObj = contactObj[0];
        // for (var object of contactObj) {
          let contactHeader = new CONTACT_HEADER();
          contactHeader.ContactId = contactObj.ContactId
          contactHeader.ContactName = contactObj.ContactName
          contactHeader.Phone = contactObj.Phone
          contactHeader.Email = contactObj.Email
          this.downloadedConatctHeaders.push(contactHeader)
  
          count = count - 1
          if (count == 0) {
            this.sortContactHeader(this.downloadedConatctHeaders)
          }
      }
     
      // }
    }else {
      if (result.message.length > 0) {
        this.hideLoader();
        this.showAlert("", result.message)
      }
      else if (result.error.length > 0) {
        this.hideLoader();
        this.showAlert("Error", result.error)
      }
    }
  }

  sortContactHeader(contactHeaders: CONTACT_HEADER[]) {
    let alphabet: any = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    this.UIModels = []
    for (var letter of alphabet) {
      let letterInLowerCase = letter.toLowerCase;
      let searchLetter = letter as string

      var matches = contactHeaders.filter(contact => contact.ContactName.startsWith(searchLetter))
      if (matches.length > 0) {
        this.ngZone.run(() => {
          let uiModel = new UIModel()
          uiModel.section = letter
          matches.sort(function (a, b) { return (a.ContactName > b.ContactName) ? 1 : ((b.ContactName > a.ContactName) ? -1 : 0); });
          uiModel.contactHeaders = matches as [CONTACT_HEADER];
          this.hideLoader();
          this.UIModels.push(uiModel)
        })
      }
    }
  }

  async showAlert(title : string, message: string){
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showAlertOnBackClick(){
    const alert = await this.alertCtrl.create({
      header: '',
      subHeader: 'Do you want to save results?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('No clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
          }
        }
      ]
    });
    await alert.present();
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
