import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ITaskFormData, IToDoItem } from './commons/interfaces';
import { AppService } from './services/app.service';
import { TaskFormComponent } from './task-form/task-form.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatListModule, CdkDrag,
    CdkDragPlaceholder,
    CdkDropList, MatChipsModule, MatToolbarModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatCardModule, MatCheckboxModule, FormsModule, CommonModule, MatDialogModule, ReactiveFormsModule]
})
export class AppComponent {

  /**
   * 
   * Local reference of the to-do list for two way binding
   * This is used in template to paint the items & is kept
   * in-sync with data from app service (local storage)
   *
   * @type {Array<IToDoItem>}
   * @memberof AppComponent
   */
  public todoList: Array<IToDoItem> = [];

  /**
   * 
   * Filter (if any) applied on the list
   * Significance of number :
   * 0 : Show only pending items
   * 1 : Show all items
   * 2 : Show only completed items
   * 
   * Write Operations :
   * This signal is set 0 by default & is updated by the 
   * mat-chips on user selection
   * 
   * Read Operations :
   * Value is read by the mat-list to filter out items as 
   * per the selected filter
   *
   * @memberof AppComponent
   */
  public toDoListFilter = signal(0);

  /**
   * 
   * Creates an instance of AppComponent.
   * Subscribe to app service and wait until app is ready
   * before accessing the to-do list
   * 
   * @param {AppService} _appService
   * @memberof AppComponent
   */
  constructor(private _appService: AppService) {

    // Subscribe to app readiness observable.
    // Wait until app is ready & stable
    // Once ready, get the list of tasks from app service
    this._appService.appReady$.pipe(
      filter(ready => !!ready),
      take(1)
    ).subscribe(_ => {
      console.log("Application ready, fetching task list");
      this.todoList = this._appService.toDoList;
    });
  }

  /**
   * 
   * To search the list of tasks
   *
   * @memberof AppComponent
   */
  readonly searchString = new FormControl<string | undefined>(undefined, []);

  /**
   * 
   * Instance of mat-dialog that will be opened for adding/updating/deleting the items
   *
   * @memberof AppComponent
   */
  private _dialog = inject(MatDialog);

  /**
   * 
   * Instance of snackbar to show updates after an operation
   * to the user.
   *
   * @private
   * @memberof AppComponent
   */
  private _snackBar = inject(MatSnackBar);

  /**
   *
   * Drag Drop is enabled for the list of tasks
   * This is an implementation of drop function for cdk drag-drop
   * Once re-arrangement is done by the user in UI, this method will 
   * re-arrange the items in the list & sync it with local storage via app service
   *
   * @param {CdkDragDrop<IToDoItem[]>} event
   * @memberof AppComponent
   */
  public drop(event: CdkDragDrop<IToDoItem[]>) {
    console.log("Drop detected, updating item order");
    moveItemInArray(this.todoList, event.previousIndex, event.currentIndex);
    this._appService.setList(this.todoList);
  }

  /**
   * Method to handle create/update/delete operations on tasks
   * Opens a dialog where details can be input and then this data is synced with the list
   *
   * @param {IToDoItem} [item] Will be provided only in case of update/delete
   * @memberof AppComponent
   */
  public openDialog(item?: IToDoItem) {
    console.log("Opening dialog", item);

    // Open the dialog
    const dialogRef = this._dialog.open(TaskFormComponent, {
      width: '400px'
    })

    // In case it is update/delete operation on existing item,
    // Prefill the values for the TaskFormComponent to access and show
    if (item) {
      dialogRef.componentInstance.id = item.id;
      dialogRef.componentInstance.title.setValue(item.title);
      dialogRef.componentInstance.description.setValue(item.description);
    }

    // Subscribe to dialog state changes & performs corresponding actions
    dialogRef.afterClosed()
      .subscribe((taskFormData: ITaskFormData) => {
        switch (taskFormData.action) {
          case "SAVE":
            // SAVE can have 2 modes - create/update
            // In case there is a pre-existing item, it is a case of update
            if (item) {
              this.todoList = this._appService.updateItem({
                id: item.id,
                title: taskFormData.title!,
                description: taskFormData.description!,
                complete: item.complete
              });
              this._snackBar.open('Task updated', '', {
                duration: 3000
              });
            }

            // Otherwise it is a new item that is being added
            else {
              this.todoList = this._appService.addItem({
                id: uuidv4(),
                title: taskFormData.title!,
                description: taskFormData.description!,
                complete: false
              });
              this._snackBar.open('Task added', '', {
                duration: 3000
              });
            }
            break;
          case "DELETE":
            // Initiate delete by id
            this.todoList = this._appService.deleteItem(taskFormData.id!);
            this._snackBar.open('Task deleted', '', {
              duration: 3000
            });
            break;
        }
      });
  }


  /**
   * 
   * Marking task as complete is a first class action on the task
   * Instead of providing in the dialog, it is acted upon via a check-box
   * This method will listen to changes on it's state and update the actual list
   *
   * @param {string} id
   * @param {boolean} complete
   * @memberof AppComponent
   */
  public updateStatus(id: string, complete: boolean): void {
    if (complete) {
      this.todoList = this._appService.markComplete(id);
      console.log('Marked Complete', id, this._appService.toDoList);
    } else {
      this.todoList = this._appService.markIncomplete(id);
      console.log('Marked Incomplete', id, this._appService.toDoList);
    }
  }
}
