import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {  debounceTime, skipWhile } from 'rxjs';

/**
 * The menu bar on top of the web UI. Contains a search field.
 *
 * @export
 * @class TopBarComponent
 * @typedef {TopBarComponent}
 * @implements {OnInit}
 */
@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [MenubarModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent implements OnInit {

  /**
   * Output EventEmitter that emmits a search term that can be passed to a component for filtering
   *
   * @type {*}
   */
  @Output()
  searchTerm = new EventEmitter<string>();

  /**
   * FormControl of the searchfield
   *
   * @public
   * @type {*}
   */
  public searchInput = new FormControl<string | null>(null);

  ngOnInit(): void {
    this.searchInput.valueChanges.pipe(
      takeUntilDestroyed(),
      skipWhile(str => !str || str?.length < 1),
      debounceTime(300)
    ).subscribe(searchTerm => this.searchTerm.emit(searchTerm!));
  }
}
