import { Routes } from '@angular/router'
import { HomeComponent } from './home'
import { AboutComponent } from './about'
import { NoContentComponent } from './no-content'
import { SettingsPage } from './settings-page/settings-page.component'

import { DataResolver } from './app.resolver'

export const ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: HomeComponent },
  { path: 'settings', component: SettingsPage },
  { path: '**', component: NoContentComponent },
]
