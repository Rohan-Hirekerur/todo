import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ITaskFormData } from '../commons/interfaces';
@Component({
  selector: 'app-task-form',
  imports: [CdkTextareaAutosize, TextFieldModule, MatLabel, MatInput, MatButtonModule, MatDialogActions, MatDialogTitle, MatDialogContent, MatFormField, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {

  /**
   * 
   * Creates an instance of TaskFormComponent.
   * @param {MatDialogRef<TaskFormComponent>} dialogRef
   * @memberof TaskFormComponent
   */
  constructor(public dialogRef: MatDialogRef<TaskFormComponent>) { }

  /**
   * 
   * To capture the title of the task
   * Will be prefilled in case of update/delete mode
   *
   * @memberof AppComponent
   */
  public title = new FormControl<string | undefined>(undefined, [
    Validators.required,
  ]);

  /**
   * 
   * ID of the task that will be provided if an item is to be updated/deleted
   *
   * @memberof AppComponent
   */
  public id: string | undefined;

  /**
   * 
   * To capture the description of the task
   * Will be prefilled in case of update/delete mode
   *
   * @memberof AppComponent
   */
  public description = new FormControl<string | undefined>(undefined, []);

  /**
   * Get the added/updated values for title & description
   * Send this data back to the initiator for action handling
   * Validity of the data will be checked from the template itself
   *
   * @param {ITaskFormData['action']} action
   * @memberof TaskFormComponent
   */
  closeDialog(action: ITaskFormData['action']) {
    switch (action) {
      case "SAVE":
        this.dialogRef.close({
          action: "SAVE",
          title: this.title.value!,
          description: this.description.value || undefined,
        });
        break;
      case "DELETE":
        this.dialogRef.close({
          action: "DELETE",
          id: this.id
        });
        break;
      default:
        this.dialogRef.close({
          action: "DISCARD"
        });
        break;
    }
  }
}
