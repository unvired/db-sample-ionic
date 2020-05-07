import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GetContactPage } from './get-contact.page';

describe('GetContactPage', () => {
  let component: GetContactPage;
  let fixture: ComponentFixture<GetContactPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetContactPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GetContactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
