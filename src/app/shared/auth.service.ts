import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs/Observable'

import { LockerModule, Locker, LockerConfig } from 'angular2-locker'

import { iPrimaryUser, PrimaryUser } from './datatypes';

@Injectable()
export class AuthService implements CanActivate {

  private hostname = "//admin.stage.artstor.org"
  private ENV = 'dev'
  /**
   * This is typcast to create an initial object reference
   *  because we pass the same reference around the entire site
   */
  private _user: PrimaryUser = <PrimaryUser>{}
  private _storage: Locker

  constructor(
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
  }

  public getServiceUrl(legacy?: boolean): string {
    let serviceUrl = '//art-aa-service.apps.'
    serviceUrl += this.ENV === 'dev' ? 'test' : 'prod' // switch between dev and prod urls
    serviceUrl += '.cirrostratus.org'
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
    .subscribe((res) => { console.log(res) }, (err) => { console.error(err) })
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
   * Gets institutional users
   */
  public getUsers(): Observable <UserResponse[]> {
    return this.http.get<UserResponse[]>(
      'http://art-aa-service.apps.test.cirrostratus.org/admin/users/manageUsers?type=active',
      // [this.getServiceUrl(true), "users", "manageUsers"].join("/") + '?type=active',
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

interface UserResponse {
  email: string,
  active: boolean,
  roles: string,
  profileid: number,
  userid: number,
  institutionid: number,
  ssenabled: boolean,
  createdate: Date,
  timelastaccessed: Date
}