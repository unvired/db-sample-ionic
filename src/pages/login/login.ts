import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { HomePage } from "../home/home";
import { AppConstant } from "../../constants/appConstant";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  isAuthenticationSuccess: boolean = false
  isHasPermissions: boolean = false;
  url = "http://192.168.98.160:8080/UMP"
  company = ""
  username = ""
  password = ""

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     public alertCtrl: AlertController,
     private Loading: LoadingController,) {
    this.isAuthenticationSuccess = this.navParams.get("isAuthenticationSuccess")
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
  
  login() {
    
        // if (this.device.platform.toLowerCase() == "android") {
        //   if (!this.isHasPermissions) {
        //     this.checkRequiredPermission();
        //     return;
        //   }
        // }
    
        if (!this.isAuthenticationSuccess) {
          if (!this.url || this.url.trim().length == 0) {
            this.showAlert("", "Enter Url.");
            return
          }
    
          if (!this.company || this.company.trim().length == 0) {
            this.showAlert("", "Enter Company.")
            return
          }
        }
    
        if (!this.username || this.username.trim().length == 0) {
          this.showAlert("", "Enter Username.")
          return
        }
    
        if (!this.password || this.password.trim().length == 0) {
          this.showAlert("", "Enter Password.")
          return
        }
    
        let loading = this.Loading.create({
          content: "Please wait.",
          dismissOnPageChange: true,
        });
    
        ump.login.parameters.appName = AppConstant.APPLICATION_NAME
        ump.login.parameters.url = this.url
        ump.login.parameters.company = this.company
        ump.login.parameters.username = this.username
        ump.login.parameters.password = this.password
    
        ump.login.login((result: any) => {
    
          if (result.type === ump.login.listenerType.auth_activation_required) {
            loading.present();
            this.authenticate()
          } else if (result.type === ump.login.listenerType.app_requires_login) {
            loading.present();
            this.authenticateLocal()
          } else if (result.type === ump.login.listenerType.auth_activation_success || result.type === ump.login.listenerType.login_success) {
            loading.dismiss()
            this.displayHomeScreen()
          } else if (result.type === ump.login.listenerType.auth_activation_error || result.type === ump.login.listenerType.login_error) {
            loading.dismiss()
            this.showAlert(AppConstant.ERROR, result.error)
          }
        })
    
      }
    
      // Authentication
      authenticate() {
        ump.login.authenticateAndActivate(function (authResult) {
          if (authResult.type === ump.login.listenerType.auth_activation_success) {
    
          }
        });
      }
    
      // AuthenticateLocal
      authenticateLocal() {
        ump.login.authenticateLocal(function (authResult) {
          if (authResult.type === ump.login.listenerType.login_success) {
    
          }
        });
      }
    
      // Check for permission
      checkRequiredPermission() {
        var permissions = cordova.plugins.permission
        var list = [
          permissions.READ_PHONE_STATE,
          permissions.WRITE_EXTERNAL_STORAGE,
          permissions.READ_EXTERNAL_STORAGE
        ]
    
        var that = this
        permissions.requestPermissions(list, function (status) {
          if (!status.hasPermission) {
            alert("Permissions required to use this application not granted.Please grant Phone and Storage permissions")
          } else {
            that.isHasPermissions = true;
            that.login();
          }
        }, function () { alert("Error while requiesting for permissions.") });
      }
    
      // Present Home Screen 
      displayHomeScreen() {
        this.navCtrl.setRoot(HomePage)
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
