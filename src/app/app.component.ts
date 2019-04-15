/**
 * Angular 2 decorators and services
 */
import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core'
import { Title } from '@angular/platform-browser'

import { AppState } from './app.service'
import { TranslateService } from 'ng2-translate'
import { FlagService } from './shared/flags.service'
import { version } from '../../package.json'

/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.scss'
  ],
  templateUrl: './app.component.pug'
})
export class AppComponent implements OnInit {
  public showSkyBanner: boolean = false
  public skyBannerCopy: string = ''
  public currentYear
  public appVersion: string = ''
  

  constructor(
    public appState: AppState,
    private _title: Title,
    private _flags: FlagService,
    translate: TranslateService
  ) {
    this._title.setTitle('Artstor Admin')
    // see https://www.npmjs.com/package/ng2-translate
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
    // Set current year
    this.currentYear = new Date().getFullYear()
    // Set app version
    this.appVersion = version
  }

  public ngOnInit() {


    this._flags.getFlagsFromService()
    .take(1)
    .subscribe((flags) => {
      // don't need to handle successful response here - this just initiates the flags
      console.log(flags)
      // Set skybanner
      this.showSkyBanner = flags.bannerShow
      this.skyBannerCopy = flags.bannerCopy
    }, (err) => {
      console.error(err)
    })
  }

}

/**
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
