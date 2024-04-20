import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TopBarComponent } from "./components/top-bar/top-bar.component";

/**
 * The main App Component
 *
 * @export
 * @class AppComponent
 * @typedef {AppComponent}
 */
@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, TopBarComponent]
})
export class AppComponent {
  /**
   * Title of the app
   *
   * @type {string}
   */
  title = 'angular-screen-recording';

  router = inject(Router)

  /**
   * Function that navigates to the search router path
   *
   * @param {string} search - search to be performed
   */
  onSearchTerm(search: string) {
    this.router.navigate(['/home', search])
  }
}