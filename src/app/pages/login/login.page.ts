import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginParameters, UnviredCordovaSDK, LoginListenerType, AuthenticateActivateResult, LoginType,
  AuthenticateAndActivateResultType, AuthenticateLocalResult, AuthenticateLocalResultType } from '@ionic-native/unvired-cordova-sdk/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isAuthenticationSuccess: LoginListenerType;
  url = 'http://sandbox.unvired.io/UMP/';
  company = '';
  username = '';
  password = '';

  constructor( public alertCtrl: AlertController,
               private loadingCtrl: LoadingController,
               private router: Router,
               private unviredCordovaSdk: UnviredCordovaSDK) {
    this.isAuthenticationSuccess = this.router.getCurrentNavigation().extras.queryParams.isAuthenticationSuccess;
  }

  ngOnInit() {
  }

  login() {
    if (!this.isAuthenticationSuccess) {
      if (!this.url || this.url.trim().length === 0) {
        this.showAlert('', 'Enter url');
        return;
      }

      if (!this.company || this.company.trim().length === 0) {
        this.showAlert('', 'Enter company');
        return;
      }
    }

    if (!this.username || this.username.trim().length === 0) {
      this.showAlert('', 'Enter username');
      return;
    }

    if (!this.password || this.password.trim().length === 0) {
      this.showAlert('', 'Enter password');
      return;
    }

    this.umpLogin();
  }

  async umpLogin() {
    const loginParameters = new LoginParameters();
    loginParameters.url = this.url;
    loginParameters.company = this.company;
    loginParameters.username = this.username;
    loginParameters.password = this.password;
    loginParameters.loginType = LoginType.unvired;

    switch (this.isAuthenticationSuccess) {
      case LoginListenerType.auth_activation_required:
        this.showLaoding();
        // tslint:disable-next-line:max-line-length
        const authenticateActivateResult: AuthenticateActivateResult = await this.unviredCordovaSdk.authenticateAndActivate(loginParameters);
        if (authenticateActivateResult.type === AuthenticateAndActivateResultType.auth_activation_success) {
          this.showAlert('', 'Successfully registered');
          this.router.navigate(['home']);
        } else if (authenticateActivateResult.type === AuthenticateAndActivateResultType.auth_activation_error) {
          console.log('Error during login:' + authenticateActivateResult.error);
          this.showAlert('Error during login:', authenticateActivateResult.error);
        }
        break;
      case LoginListenerType.app_requires_login:
        this.showLaoding();
        const authenticateLocalResult: AuthenticateLocalResult = await this.unviredCordovaSdk.authenticateLocal(loginParameters);
        if (authenticateLocalResult.type === AuthenticateLocalResultType.login_success) {
          this.showAlert('', 'Local Password verified Successfully');
          this.router.navigate(['home']);
        } else if (authenticateLocalResult.type === AuthenticateLocalResultType.login_error) {
          this.showAlert('', authenticateLocalResult.error);
          console.log('Error during local login: ' + authenticateLocalResult.error);
        }
        break;
      case LoginListenerType.login_success:
        this.router.navigate(['/home']);
        break;
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

  async showLaoding() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 3000
    });
    await loading.present();
  }

}
