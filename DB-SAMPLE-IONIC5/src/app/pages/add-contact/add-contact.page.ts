import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CONTACT_HEADER } from 'src/models/CONTACT_HEADER';
import { AlertController , Platform} from '@ionic/angular';
import { AppConstant } from '../../../constants/appConstants';
import { UnviredCordovaSDK, RequestType, ResultType } from '@ionic-native/unvired-cordova-sdk/ngx';
import { HomePageService } from 'src/app/services/home-page.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.page.html',
  styleUrls: ['./add-contact.page.scss'],
})
export class AddContactPage implements OnInit {
  private contactHeader = new CONTACT_HEADER();

  constructor(private router: Router,
              private alertController: AlertController,
              private unviredSDK: UnviredCordovaSDK,
              private homeService: HomePageService,
              private platform: Platform,
              private route: ActivatedRoute) { }       

  ngOnInit() {
    this.route.paramMap.subscribe(()=>{
      this.homeService.subscription.unsubscribe();
    })
  }

  goToHome(){
    this.router.navigate(['/home']);
  }

  createContact(){
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
      this.sendDataToServer();     
  }

  async sendDataToServer(){
    console.log("Sending data to server.....");
    var inputHeader: any = {};
    inputHeader["CONTACT_HEADER"] = this.contactHeader;
    const data = { CONTACT : [inputHeader]};
    console.log("INSERTING DATA TO SERVER");
    let  result = await this.unviredSDK.syncForeground(RequestType.RQST, '', data, 'UNVIRED_DB_SAMPLE_PA_CREATE_CONTACT', true);
    ///let  result = await this.unviredSDK.syncForeground(RequestType.RQST, '', data, 'UNVIRED_DB_SAMPLE_PA_CREATE_CONTACT', true);
    console.log("***RESULT****", result);
    if(result.type == ResultType.success){
      this.showAlert("","Contact Created Successfully");
    }else{
      console.log("ERROR",result.error);
      this.showAlert("",result.error);
    }
    this.contactHeader.ContactName = '';
    this.contactHeader.Phone = '';
    this.contactHeader.Email = '';

    this.homeService.sub.next('');
    //this.router.navigate(['/home']);

    // let resultSelect = this.unviredSDK.dbSelect(AppConstant.TABLE_NAME_CONTACT_HEADER, '');
    // console.log("Result getting from CONTACT_HEADER---- ", resultSelect);
  }

  async showAlert(title: string, message: string){
    const alert = await this.alertController.create({
      header: title,
      subHeader: message,
      buttons: ['OK']
    });
    await alert.present();
  }
  
}
