import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { AppConstant } from "../constants/appConstant";
import { LoginPage } from "../pages/login/login";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  @ViewChild('myNav') nav;
  
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      ump.login.parameters.appName = AppConstant.APPLICATION_NAME
      
            ump.login.login((result: any) => {
              console.log(JSON.stringify(result))
              if (result.type === ump.login.listenerType.auth_activation_required) {
                console.log("Required Authentication and Activation....")
                this.nav.setRoot(LoginPage, { isAuthenticationSuccess: false })
              } else if (result.type === ump.login.listenerType.app_requires_login) {
                console.log("Required Authentication Local....")
                // this.nav.setRoot(LoginPage, { isAuthenticationSuccess: true })
                this.rootPage = HomePage
              } else {
                console.log("Load Home Screen....")
                this.rootPage = HomePage
              }
            })
    });
  }
}

