import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { IToDoItem } from '../commons/interfaces';

@Injectable({
    providedIn: 'root',
})
export class AppService {

    /**
     *
     * Behavior subject to keep a track of the items in to-d0 list
     *
     * @private
     * @type {BehaviorSubject<Array<IToDoItem>>}
     * @memberof AppService
     */
    private _todoList$: BehaviorSubject<Array<IToDoItem>>;


    /**
     *
     * Check the readiness of the app.
     * Will be marked as ready when all the basic processes are complete
     * Today, there's only one process, i.e. syncing data with local storage
     *
     * @type {BehaviorSubject<boolean>}
     * @memberof AppService
     */
    public appReady$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /**
     * 
     * Creates an instance of AppService.
     * @memberof AppService
     */
    constructor() {

        // Check if data already exists in local storage
        const stringifiedList: string = window.localStorage.getItem('todoList') || '[]';

        const savedList: Array<IToDoItem> = JSON.parse(stringifiedList);
        console.log('List from local storage : ', savedList);

        // Set the data for this instance as received from local storage 
        this._todoList$ = new BehaviorSubject<Array<IToDoItem>>(savedList);

        // All processes complete, mark app as ready
        this.appReady$.next(true);

        // Initiate listener for any changes to the to-do list
        // These changes will be synced with local storage periodically
        this._todoList$
            .pipe(debounceTime(50))
            .subscribe(updatedList => {
                console.log('Updating list in local storage : ', updatedList);
                window.localStorage.setItem('todoList', JSON.stringify(updatedList));
            });
    }

    /**
     *
     * Getter for Just-In-Time value of to-do list
     *
     * @readonly
     * @memberof AppService
     */
    public get toDoList() {
        return this._todoList$.value;
    }


    /**
     *
     * Method to add item to the list
     *
     * @param {IToDoItem} item
     * @return {*} 
     * @memberof AppService
     */
    public addItem(item: IToDoItem): Array<IToDoItem> {
        this._todoList$.next([...this.toDoList, item]);
        return this.toDoList;
    }

    /**
     *
     * Method to set the items of the list.
     * This can be used in 2 major ways :
     * 1. Bulk insert/update/delete operations
     * 2. Set order of existing list after user re-arranges the items
     *
     * @param {Array<IToDoItem>} list
     * @return {Array<IToDoItem>} 
     * @memberof AppService
     */
    public setList(list: Array<IToDoItem>): Array<IToDoItem> {
        this._todoList$.next(list);
        return this.toDoList;
    }

    /**
     *
     * Method to update item of the list
     *
     * @param {IToDoItem} item
     * @return {*} 
     * @memberof AppService
     */
    public updateItem(newItem: IToDoItem): Array<IToDoItem> {
        const toDoList = this.toDoList;
        this._todoList$.next(toDoList.map(item => item.id === newItem.id ? newItem : item));
        return this.toDoList;
    }

    /**
     *
     * Method to mark item as complete
     *
     * @param {string} id
     * @return {*}  {Array<IToDoItem>}
     * @memberof AppService
     */
    public markComplete(id: string): Array<IToDoItem> {
        const toDoList = this.toDoList;
        this._todoList$.next(toDoList.map(item => item.id === id ? { ...item, complete: true } : item));
        return this.toDoList;
    }

    /**
     *
     * Method to mark item as incomplete
     *
     * @param {string} id
     * @return {*}  {Array<IToDoItem>}
     * @memberof AppService
     */
    public markIncomplete(id: string): Array<IToDoItem> {
        const toDoList = this.toDoList;
        this._todoList$.next(toDoList.map(item => item.id === id ? { ...item, complete: false } : item));
        return this.toDoList;
    }

    /**
     *
     * Method to toggle completeness of item
     *
     * @param {string} id
     * @return {*}  {Array<IToDoItem>}
     * @memberof AppService
     */
    public toggleComplete(id: string): Array<IToDoItem> {
        const toDoList = this.toDoList;
        this._todoList$.next(toDoList.map(item => item.id === id ? { ...item, complete: !item.complete } : item));
        return this.toDoList;
    }

    /**
     *
     * Method to delete an item from the list
     *
     * @param {string} id
     * @return {*}  {Array<IToDoItem>}
     * @memberof AppService
     */
    public deleteItem(id: string): Array<IToDoItem> {
        const toDoList = this.toDoList;
        this._todoList$.next(toDoList.filter(item => item.id !== id));
        return this.toDoList;
    }

}