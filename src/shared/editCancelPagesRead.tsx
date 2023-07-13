export function editPagesRead(bookId: number) {
  const pagesReadText = document.getElementById(`pages-read-text-${bookId}`);
  const pagesReadInputDiv = document.getElementById(`pages-read-input-div-${bookId}`);
  pagesReadText!.style.display = "none";
  pagesReadInputDiv!.style.display = "flex";
}

export function cancelEditPagesRead(bookId: number) {
  const pagesReadText = document.getElementById(`pages-read-text-${bookId}`);
  const pagesReadInputDiv = document.getElementById(`pages-read-input-div-${bookId}`);
  pagesReadText!.style.display = "block";
  pagesReadInputDiv!.style.display = "none";
}