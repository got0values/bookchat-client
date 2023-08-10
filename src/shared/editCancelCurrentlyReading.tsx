
export function showEditCurrentlyReading(bookId: string) {
  const currentlyReading = document.getElementById(`currently-reading-${bookId}`);
  const currentlyReadingEditButton = document.getElementById(`edit-currently-reading-button-${bookId}`);
  const currentlyReadingCancelEditButton = document.getElementById(`cancel-edit-currently-reading-button-${bookId}`);
  const currentlyReadingEdit = document.getElementById(`edit-currently-reading-${bookId}`);
  currentlyReading!.style.display = "none";
  currentlyReadingEditButton!.style.display = "none";
  currentlyReadingCancelEditButton!.style.display = "block";
  currentlyReadingEdit!.style.display = "block";
}

export function hideEditCurrentlyReading(bookId: string) {
  const currentlyReading = document.getElementById(`currently-reading-${bookId}`);
  console.log(bookId)
  const currentlyReadingEditButton = document.getElementById(`edit-currently-reading-button-${bookId}`);
  const currentlyReadingCancelEditButton = document.getElementById(`cancel-edit-currently-reading-button-${bookId}`);
  const currentlyReadingEdit = document.getElementById(`edit-currently-reading-${bookId}`);
  currentlyReading ? currentlyReading!.style.display = "block" : null;
  currentlyReadingEditButton ? currentlyReadingEditButton!.style.display = "block" : null;
  currentlyReadingCancelEditButton ? currentlyReadingCancelEditButton!.style.display = "none" : null;
  currentlyReadingEdit ? currentlyReadingEdit!.style.display = "none" : null;
}

export function editCurrentlyReadingThoughts(bookId: number) {
  const currentlyReadingText = document.getElementById(`currently-reading-text-${bookId}`);
  const currentlyReadingInputDiv = document.getElementById(`currently-reading-input-div-${bookId}`);
  currentlyReadingText!.style.display = "none";
  currentlyReadingInputDiv!.style.display = "flex";
}

export function cancelEditCurrentlyReadingThoughts(bookId: number) {
  const currentlyReadingText = document.getElementById(`currently-reading-text-${bookId}`);
  const currentlyReadingInputDiv = document.getElementById(`currently-reading-input-div-${bookId}`);
  currentlyReadingText!.style.display = "block";
  currentlyReadingInputDiv!.style.display = "none";
}