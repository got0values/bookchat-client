
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