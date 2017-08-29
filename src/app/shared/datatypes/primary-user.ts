import { LoginResponse } from './../auth.service' // the login response is the root of the user object

// our way of 'dressing up' the login response into a useful object
export class PrimaryUser {
  // PROPERTIES //
  /**
   * All of the private properties should be modified only via methods attached to the PrimaryUser object,
   *  not directly from the outside. The underscore identifies a private property.
   * Any property which is does not need certain getter/setter logic can be public
   * If you're not sure, make it private and provide appropriate getters/setters
   */
  public email: string
  public firstname: string
  public lastname: string
  /** The logged in state of the user */
  private _isLoggedIn: boolean

  /**
   * The PrimaryUser should be constructable using only the response from login
   *  any other data/modifications should be handled through methods!
   * @param res the data returned by the api's login endpoint
   */
  constructor(res: LoginResponse) {
    this.email = res.email
    this.firstname = res.firstname
    this.lastname = res.lastname
    this.isLoggedIn = true
  }

  // GETTERS AND SETTERS //
  /**
   * Here's where we provide access to the private properties outlined above - we're able to intercept the logic
   *  so that, any time a property is "got" or "set", we can make sure something runs. A good example is the set for
   *  the logged in state.
   */
  get isLoggedIn(): boolean {
    return this._isLoggedIn
  }

  set isLoggedIn(state: boolean) {
    this._isLoggedIn = state
  }
}