import { Component } from '@angular/core';
import { NavController, NavParams } from "ionic-angular";

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GetContact');
  }

}
