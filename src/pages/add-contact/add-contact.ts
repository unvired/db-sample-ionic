import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Events } from "ionic-angular";
import { CONTACT_HEADER } from '../../models/CONTACT_HEADER';
import { AppConstant } from '../../constants/appConstant';

/**
 * Generated class for the AddContact page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-add-contact',
  templateUrl: 'add-contact.html',
})

export class AddContact {
  private contactHeader = new CONTACT_HEADER()

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private Loading: LoadingController,
    public events: Events) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddContact');
  }

  createButtonCliked() {

    if (this.contactHeader.ContactName == undefined || this.contactHeader.ContactName.length == 0 || this.contactHeader.ContactName == "") {
      this.showAlert("", "Enter name.")
      return
    }

    if (this.contactHeader.Phone == undefined || this.contactHeader.Phone.length == 0 || this.contactHeader.Phone == "") {
      this.showAlert("", "Enter Phone number.")
      return
    }

    if (this.contactHeader.Email == undefined || this.contactHeader.Email.length == 0 || this.contactHeader.Email == undefined) {
      this.showAlert("", "Enter Email.")
      return
    }

    this.sendDataToServer()
  }

  sendDataToServer() {
    console.log("Sending data to server.....")
    var that = this
    let loading = this.Loading.create({
      content: "Please wait.",
      dismissOnPageChange: true,
    });

    var inputHeader: any = {}

    inputHeader["CONTACT_HEADER"] = this.contactHeader

    loading.present()
    ump.sync.submitInSync(ump.sync.requestType.RQST, inputHeader, null, AppConstant.PA_CREATE_CONTACT, true, function (result) {
      loading.dismiss()
      alert("Result:" + JSON.stringify(result))
      if (result.type === ump.resultType.success) {
        that.showAlert("", "Contact Added.")
        that.events.publish('didDownloadConatct')
      }
      else {
        if (result.message.length > 0) {
          that.showAlert("", result.message)
        }
        else if (result.error.length > 0) {
          that.showAlert("Error", result.error)
        }
      }
    })
  }

  showAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: [{
        text: 'Ok'
      }],
    });
    alert.present();
  }
}
