/** Thrown by createList/renameList when another list already has the same name, case-insensitively. */
export default class DuplicateListNameError extends Error {
  constructor() {
    super("A list with this name already exists");
    this.name = "DuplicateListNameError";
  }
}
