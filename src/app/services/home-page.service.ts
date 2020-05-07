import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomePageService {
  public sub;
  public subscription;

  constructor() {
     this.sub = new BehaviorSubject('');
   }

   getSubject(){
     return this.sub.asObservable()
   }
}
