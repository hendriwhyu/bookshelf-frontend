const books = [];
const RENDER_BOOK = "render-book";
const SAVED_EVENT = "saved-book";
const REMOVED_EVENT = "removed-book";
const STORAGE_KEY = "BOOK_APPS";

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  document.addEventListener(RENDER_BOOK, () => {
    const uncompletedBookList = document.getElementById(
      "incompleteBookshelfList"
    );
    uncompletedBookList.innerHTML = "";

    const completedBookList = document.getElementById("completeBookshelfList");
    completedBookList.innerHTML = "";

    for (const bookItem of books) {
      const bookElement = makeBook(bookItem);
      if (!bookItem.isCompleted) {
        uncompletedBookList.append(bookElement);
      } else {
        completedBookList.append(bookElement);
      }
    }
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBooks();
  });

  if (isStorageExists()) {
    loadDataFromStorage();
  }
});

const generateId = () => {
  return +new Date();
};

const generateBookObject = (id, title, author, year, isCompleted) => {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
};

const addBook = () => {
  const titleBook = document.getElementById("inputBookTitle").value;
  const authorBook = document.getElementById("inputBookAuthor").value;
  const yearBook = document.getElementById("inputBookYear").value;
  const inputBookComplete = document.getElementById("inputBookIsComplete");
  const generatedID = generateId();
  if (inputBookComplete.checked) {
    const bookObject = generateBookObject(
      generatedID,
      titleBook,
      authorBook,
      parseInt(yearBook),
      true
    );
    books.push(bookObject);
  } else {
    const bookObject = generateBookObject(
      generatedID,
      titleBook,
      authorBook,
      parseInt(yearBook),
      false
    );
    books.push(bookObject);
  }
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
};

const searchBooks = () => {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const searchResults = books.filter((book) => {
    return book.title.toLowerCase().includes(searchTitle);
  });

  console.log(searchResults);

  if (searchTitle === "") {
    books.length = 0;
    loadDataFromStorage();
  } else {
    books.length = 0;
    for (const result of searchResults) {
      books.push(result);
      document.dispatchEvent(new Event(RENDER_BOOK));

      console.log(books);
    }
  }
};

const findBook = (bookId) => {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
};

const addBookToCompleted = (bookId) => {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) {
    return null;
  }
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
};

const makeBook = (bookObject) => {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;

  const authorBook = document.createElement("p");
  authorBook.innerText = bookObject.author;

  const yearBook = document.createElement("p");
  yearBook.innerText = bookObject.year;

  const bookArticle = document.createElement("article");
  bookArticle.classList.add("book_item");
  bookArticle.append(bookTitle, authorBook, yearBook);
  bookArticle.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.innerText = "Belum selesai di Baca";
    undoButton.classList.add("green");

    undoButton.addEventListener("click", () => {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus buku";
    trashButton.classList.add("red");

    trashButton.addEventListener("click", () => {
      removeBookFromCompleted(bookObject.id);
    });

    const actionButton = document.createElement("div");
    actionButton.classList.add("action");
    actionButton.append(undoButton, trashButton);

    bookArticle.append(actionButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.innerText = "Selesai dibaca";
    checkButton.classList.add("green");

    checkButton.addEventListener("click", () => {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus buku";
    trashButton.classList.add("red");

    trashButton.addEventListener("click", () => {
      removeBookFromCompleted(bookObject.id);
    });

    const actionButton = document.createElement("div");
    actionButton.classList.add("action");
    actionButton.append(checkButton, trashButton);

    bookArticle.append(actionButton);
  }

  return bookArticle;
};

const undoBookFromCompleted = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
};

const removeBookFromCompleted = (bookId) => {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget == -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_BOOK));
  removeData();
};

const findBookIndex = (bookId) => {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
};

const saveData = () => {
  if (isStorageExists()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const removeData = () => {
  if (isStorageExists()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(REMOVED_EVENT));
  }
};

const isStorageExists = () => {
  if (typeof Storage === "undefined") {
    alert("Browser anda tidak mendukung local storage");
    return false;
  }
  return true;
};

document.addEventListener(SAVED_EVENT, () => {
  alert("Buku telah ditambahkan");
});
document.addEventListener(REMOVED_EVENT, () => {
  alert("Buku telah dihapus");
});

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_BOOK));
};
