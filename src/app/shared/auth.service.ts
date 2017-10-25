import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Rx'

import { LockerModule, Locker, LockerConfig } from 'angular2-locker'

import { iPrimaryUser, PrimaryUser } from './datatypes' 

import { IdleWatcherUtil } from './idle-watcher'
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core'
import { Keepalive } from '@ng-idle/keepalive'

@Injectable()
export class AuthService implements CanActivate {

  private ENV = 'dev'
  /**
   * This is typcast to create an initial object reference
   *  because we pass the same reference around the entire site
   */
  private _user: PrimaryUser = <PrimaryUser>{}
  private _storage: Locker

  private idleState: string = 'Not started.'
  private idleUtil: IdleWatcherUtil = new IdleWatcherUtil() // Idle watcher, session timeout values are abstracted to a utility
  public showUserInactiveModal: Subject<boolean> = new Subject() //Set up subject observable for showing inactive user modal

  constructor(
    private idle: Idle,
    private keepalive: Keepalive,
    private _router: Router,
    private http: HttpClient,
    locker: Locker
  ) {
    this._storage = locker.useDriver(Locker.DRIVERS.LOCAL)

    // if the user is already logged in, we can check for their object
    let savedUser: iPrimaryUser = this._storage.get('user')
    if (savedUser) {
      this.user = new PrimaryUser(savedUser)
    }

    // For session timeout on user inactivity
    idle.setIdle(this.idleUtil.generateIdleTime()); // Set an idle time of 1 min, before starting to watch for timeout
    idle.setTimeout(this.idleUtil.generateSessionLength()); // Log user out after 90 mins of inactivity
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
    });
    idle.onTimeout.subscribe(() => {
      if(this._user && this._user.isLoggedIn){
        this.expireSession();
        this.showUserInactiveModal.next(true);
        this.idleState = 'Timed out!';
      }
      else{
        this.resetIdleWatcher()
      }
    });
    idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!';

      let currentDateTime = new Date().toUTCString();
      this._storage.set('userGoneIdleAt', currentDateTime);
    });
    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!'
    });

    this.resetIdleWatcher();
  }

  // Reset the idle watcher
  public resetIdleWatcher(): void {
    this.idle.watch();
    this.idleState = 'Idle watcher started';
  }

  private expireSession(): void {
    setTimeout( () => {
      this.logoutUser()
    }, 1500)
  }

  public getServiceUrl(legacy?: boolean): string {
    let serviceUrl: string = '//admin'
    serviceUrl += this.ENV === 'dev' ? '.stage' : ''
    serviceUrl += '.artstor.org'
    legacy ? serviceUrl += "/api" : serviceUrl += '/admin'

    return serviceUrl
  }

  get user(): PrimaryUser {
    return this._user
  }

  set user(user: PrimaryUser) {
    this._user = user
    this._storage.set('user', this._user) // serialize it to local storage
  }

  /**
   * Deletes clears storage, deletes user object, triggers the logout call and navigates to /login
   */
  public logoutUser(): void {
    // nav the user to login page
    this._router.navigate(['/login'])
    // clear local storage
    this._storage.clear()
    // reset the user object
    this._user = <PrimaryUser>{}
    // make the logout request
    this.http.post<any>(
      [this.getServiceUrl(true), "secure", "logout"].join("/") + "?target=" + encodeURIComponent('/api/secure/userinfo'),
      {},
      { withCredentials: true }
    )
    .take(1)
    .subscribe((res) => { /** do nothing, it was successful */ }, (err) => { console.error(err) })
  }

  /**
   * Makes http call to log user into admin tools, which returns sessionid cookie
   * @param username user's email
   * @param password user's password
   */
  public login(username: string, password: string): Observable<LoginResponse> {
    let data = this.formEncode({
      username: username,
      password: password
    })

    return this.http.post<LoginResponse>(
      [this.getServiceUrl(), "users", "login"].join("/"),
      data,
      {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
        withCredentials: true
      }
    )
  }

  /**
   * Makes http call to update institutional details
   * @param instForm institutional form data
   */
  public updateInst(instForm: any): Observable<any> {

    let data = this.formEncode({
      instPrivContactEmail: instForm.value.admin_email,
      instPrivContactName: instForm.value.admin_name,
      instPrivContactPhone: instForm.value.admin_phone,
      localSupportAdminName: instForm.value.admin_name,
      localSupportEmail: instForm.value.admin_email,
      localSupportPhone: instForm.value.admin_phone,
      pcEnable: '1',
    })

    return this.http.post<any>(
      [this.getServiceUrl(), "api/insitution"].join("/"),
      data,
      {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
        withCredentials: true
      }
    )
  }

  /**
   * Gets the logged in user's institution's info
   */
  public getInstitution(): Observable <InstitutionInfoResponse> {
    return this.http.get<InstitutionInfoResponse>(
      [this.getServiceUrl(true), "secure", "institution"].join("/"),
      { withCredentials: true }
    )
  }

  /**
   * Encodes javascript object into a URI component
   * @param obj The object to be encoded
   */
  public formEncode(obj: Object): string {
    var encodedString = ''
    for (var key in obj) {
        if (encodedString.length !== 0) {
            encodedString += '&'
        }
        encodedString += key + '=' + encodeURIComponent(obj[key])
    }
    return encodedString.replace(/%20/g, '+')
  }

  /**
   * Called to verify whether or not user is logged in
   *  went ahead and did the async format so that we can eventually return an http call here
   * @returns boolean indicating whether or not to pass on to the next route guard
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('canactivate running', this.user, this.user.isLoggedIn)
    if (this.user && this.user.isLoggedIn) {
      return Observable.of(true)
    } else {
      this._router.navigate(['/login'])
      return Observable.of(false)
    }
  }
}

export interface LoginResponse {
  email: string
  firstname: string
  lastname: string
  message: string
  status: number
}

interface InstitutionInfoResponse {
  
  institution: {
    country: string,
    id: string,
    name: string,
    access_code: string,
    access_password: string,
    default_user_id: string,
    default_user_pwd: string,
    display_name: string,
    region_id: string,
    ss_enabled: string
  },
  instsupport: {
    contact_email: string,
    contact_name: string,
    institution_id: number,
    show_option: string
  }
  
}