import { BrowserModule } from '@angular/platform-browser'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Http } from '@angular/http'
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http'
import {
  NgModule,
  ApplicationRef
} from '@angular/core'
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr'
import {
  RouterModule,
  PreloadAllModules
} from '@angular/router'

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment'
import { ROUTES } from './app.routes'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate'
import { Ng2CompleterModule } from 'ng2-completer'
import { LockerModule } from 'angular2-locker'


// App is our top level component
import { AppComponent } from './app.component'
import { APP_RESOLVER_PROVIDERS } from './app.resolver'
import { AppState, InternalStateType } from './app.service'
import { HeaderComponent } from './header/header.component'
import { HomeComponent } from './home'
import { NoContentComponent } from './no-content'
import { LoginPage } from './login-page/login-page.component'
import { NavComponent } from './nav/nav.component'
import { RegisterPage } from './register-page/register-page.component'
import { SettingsPage } from './settings-page/settings-page.component'
import { UserDetailsModal } from './modals'
import { UsersPage } from './users-page/users-page.component'


import '../styles/styles.scss'
// import '../styles/headings.css'

// Application wide providers
import { AuthService } from './shared'
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  AuthService
]

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    // i've been alphabetizing these from the start to make it easier to find components
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginPage,
    NavComponent,
    NoContentComponent,
    RegisterPage,
    SettingsPage,
    UserDetailsModal,
    UsersPage
  ],
  /**
   * Import Angular's modules.
   */
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'sessionid'
    }),
    LockerModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
        deps: [Http]
    }),
    NgbModule.forRoot(),
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   */
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) {}

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return
    }
    console.log('HMR store', JSON.stringify(store, null, 2))
    /**
     * Set state
     */
    this.appState._state = store.state
    /**
     * Set input values
     */
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues
      setTimeout(restoreInputValues)
    }

    this.appRef.tick()
    delete store.state
    delete store.restoreInputValues
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement)
    /**
     * Save state
     */
    const state = this.appState._state
    store.state = state
    /**
     * Recreate root elements
     */
    store.disposeOldHosts = createNewHosts(cmpLocation)
    /**
     * Save input values
     */
    store.restoreInputValues  = createInputTransfer()
    /**
     * Remove styles
     */
    removeNgStyles()
  }

  public hmrAfterDestroy(store: StoreType) {
    /**
     * Display new elements
     */
    store.disposeOldHosts()
    delete store.disposeOldHosts
  }

}
