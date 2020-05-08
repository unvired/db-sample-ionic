import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { CONTACT_HEADER, UIModel } from 'src/models/CONTACT_HEADER';
import { UnviredCordovaSDK, ResultType } from '@ionic-native/unvired-cordova-sdk/ngx';
import { AppConstant } from 'src/constants/appConstants';
import { HomePageService } from 'src/app/services/home-page.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public contacts;
  private conatctHeaders: CONTACT_HEADER[] = [];
  private searchResultDataSource: CONTACT_HEADER[] = [];
  UIModels: UIModel[] = [];

  constructor(private router: Router,
              private actionSheetCtrl: ActionSheetController,
              public ngZone: NgZone,
              public alertController: AlertController,
              private unviredSDK: UnviredCordovaSDK,
              private homeService: HomePageService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.homeService.subscription = this.homeService.getSubject().subscribe((data) => {
        this.displayContacts();
      });
    });
  }

  displayContacts() {
    console.log('Get All Conatct Headers from DB.....');
    this.unviredSDK.dbSelect(AppConstant.TABLE_NAME_CONTACT_HEADER, '')
    .then((result) => {
      if (result.type === ResultType.success) {
          this.conatctHeaders = result.data;
          this.sortContactHeader(this.conatctHeaders);
          console.log('Conatct Headers from DB:' + this.conatctHeaders.length);
        }
    })
    .catch(error => {
       console.log(' Error while fetching the data from server...');
    });
  }

  async menuButtonClicked() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Get Contacts',
          handler: () => {
            console.log('Get Contacts clicked');
            this.router.navigate(['/get-contact']);
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

    async presentAlert() {
      const alert = await this.alertController.create({
        header: 'Alert',
        subHeader: 'Subtitle',
        message: 'This is an alert message.',
        buttons: ['OK']
      });
      await alert.present();
    }

  addContact() {
    this.router.navigate(['/add-contact']);
  }

  sortContactHeader(contactHeaders: CONTACT_HEADER[]) {
    this.ngZone.run(() => {
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
            this.UIModels.push(uiModel);
          });
        }
      }
    });
  }

  filterData(ev: any) {
    // Reset items back to all of the items
    this.sortContactHeader(this.conatctHeaders);

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== '') {
      this.searchResultDataSource = this.conatctHeaders.filter((contact) => {
        return ((contact.ContactName.toLowerCase().indexOf(val.toLowerCase()) > -1));
      });
      this.sortContactHeader(this.searchResultDataSource);
    }
  }

}
