import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Navbar, Events } from "ionic-angular";
import { CONTACT_HEADER, UIModel } from "../../models/CONTACT_HEADER";
import { AppConstant } from "../../constants/appConstant";

/**
 * Generated class for the GetContact page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-get-contact',
  templateUrl: 'get-contact.html',
})

export class GetContact {
  @ViewChild(Navbar) navBar: Navbar;
  private contactHeader = new CONTACT_HEADER()
  private downloadedConatctHeaders: CONTACT_HEADER[] = []
  private UIModels: UIModel[] = []
  private didGetContacts: boolean = false

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private Loading: LoadingController,
    private ngZone: NgZone,
    public events: Events) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GetContact');
    this.navBar.backButtonClick = (e: UIEvent) => {
      var that = this
      if (that.didGetContacts) {
        let alert = this.alertCtrl.create({
          title: "",
          subTitle: "Do you want to save results?",
          buttons: [{
            text: 'Yes',
            handler: () => {
              // Save value into DB

              let count = that.downloadedConatctHeaders.length;
              for (var contact of that.downloadedConatctHeaders) {
                let query = "DELETE FROM " + AppConstant.TABLE_NAME_CONTACT_HEADER + " WHERE ContactId = '" + contact.ContactId + "'"
                console.log("query:" + query)
                ump.db.executeStatement(query, result => {
                  if (result.type === ump.resultType.success) {
                    count = count - 1
                    if (count == 0) {
                      this.saveHeadersToDB()
                    }
                  }
                })
              }
            }
          }, {
            text: 'No',
            handler: () => {
              this.navCtrl.pop();
            }
          }
          ],
        });
        alert.present();
      }
      else {
        this.navCtrl.pop()
      }
    }
  }

  saveHeadersToDB() {
    var count = this.downloadedConatctHeaders.length
    for (var contact of this.downloadedConatctHeaders) {

      ump.db.insert(AppConstant.TABLE_NAME_CONTACT_HEADER, contact, true, (result: ump.callbackResult) => {
        if (result.type === ump.resultType.success) {
          console.log("Added Contact Header Successfully :" + JSON.stringify(result))
          count = count - 1
          if (count == 0) {
            this.events.publish('didDownloadConatct')
            this.navCtrl.pop()
          }
        }
        else {
          console.log("Failure: " + JSON.stringify(result));
          count = count - 1
          if (count == 0) {
            this.events.publish('didDownloadConatct')
            this.navCtrl.pop()
          }
        }
      })
    }
  }

  searchButtonClicked() {
    this.didGetContacts = false;

    if (this.contactHeader.ContactId != undefined || this.contactHeader.ContactName.length > 0) {
      this.sendDataToServer()
    }
    else {
      this.showAlert("", "Plesae provide valid input.")
    }
  }

  sendDataToServer() {
    var that = this
    this.downloadedConatctHeaders = []

    let loading = this.Loading.create({
      content: "Please wait.",
      dismissOnPageChange: true,
    });

    var inputHeader = {}
    inputHeader["CONTACT_HEADER"] = this.contactHeader
    loading.present()

    ump.sync.submitInSync(ump.sync.requestType.PULL, inputHeader, null, AppConstant.PA_GET_CONTACT, false, function (result) {
      loading.dismiss()
      that.didGetContacts = true
      console.log("Response from server: " + JSON.stringify(result))
      if (result.type === ump.resultType.success) {
        let jsonObj = result.data
        let contactObj = jsonObj.CONTACT

        var count = contactObj.length
        for (var object of contactObj) {
          let contactHeader = new CONTACT_HEADER
          contactHeader.ContactId = object.CONTACT_HEADER.ContactId
          contactHeader.ContactName = object.CONTACT_HEADER.ContactName
          contactHeader.Phone = object.CONTACT_HEADER.Phone
          contactHeader.Email = object.CONTACT_HEADER.Email
          that.downloadedConatctHeaders.push(contactHeader)

          count = count - 1
          if (count == 0) {
            that.sortContactHeader(that.downloadedConatctHeaders)
          }
        }
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

}
