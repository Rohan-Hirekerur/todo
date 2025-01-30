/**
 * Structure of each item in the to-do list
 *
 * @export
 * @interface IToDoItem
 */
export interface IToDoItem {
    /**
     * Unique identifier for item
     *
     * @type {string}
     * @memberof IToDoItem
     */
    id: string;

    /**
     * Title for the task
     *
     * @type {string}
     * @memberof IToDoItem
     */
    title: string;


    /**
     * Description of the task
     *
     * @type {string}
     * @memberof IToDoItem
     */
    description: string;

    /**
     * Status of task - complete/incomplete
     *
     * @type {boolean}
     * @memberof IToDoItem
     */
    complete: boolean;
}

/**
 *
 *
 * @export
 * @interface ITaskFormData
 */
export interface ITaskFormData {
    /**
     * Operation that is to be performed
     *
     * @type {('SAVE' | "DELETE" | 'DISCARD')}
     * @memberof ITaskFormData
     */
    action: 'SAVE' | "DELETE" | 'DISCARD';

    /**
     * Id that will be provided in case of update/delete
     *
     * @type {string}
     * @memberof ITaskFormData
     */
    id?: string;

    /**
     *
     * New/updated title 
     *
     * @type {string}
     * @memberof ITaskFormData
     */
    title?: string;

    /**
     *
     * New/updated description 
     *
     * @type {string}
     * @memberof ITaskFormData
     */
    description?: string;
}