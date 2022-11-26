const PREFIX = "???";
const log = console.log;
const req = (url, options = {}) => {
  const { body } = options;

  return fetch((PREFIX + url).replace(/\/\/$/, ""), {
    ...options,
    body: body ? JSON.stringify(body) : null,
    headers: {
      ...options.headers,
      ...(body
        ? {
          "Content-Type": "application/json",
        }
        : null),
    },
  }).then((res) =>
    res.ok
      ? res.json()
      : res.text().then((message) => {
        throw new Error(message);
      })
  );
};

export const getNotes = async ({ age, search, page }) => {
  const notes = await fetch(
    `/dashboard/getNotes?` +
    new URLSearchParams({
      age,
      search,
      page,
    })
  ).then((results) => results.json());
  return notes;
};

export const createNote = async (title, text) => {
  const newNote = {
    title: title,
    note: text,
  };
  const response = await fetch(`${location.origin}/dashboard/newNotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(newNote),
  });
  const result = await response.json();
  log("result=", result);
  return result;
};

export const getNote = async (id) => {
  const note = await fetch(`/dashboard/note/${id}`).then((result) => result.json());
  log("getNote=", note);
  return note;
};

export const archiveNote = async (id) => {
  const note = {
    id,
  };
  await fetch("/dashboard/archive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(note),
  });
};

export const unarchiveNote = async (id) => {
  const note = {
    id,
  };
  await fetch(`/dashboard/unarchive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(note),
  });
};

export const editNote = async (id, title, text) => {
  const editedNote = {
    id,
    title,
    text,
  };
  log("editedNote=", editedNote);
  // const result
  const note = await fetch(`${location.origin}/dashboard/editNote/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(editedNote),
  });
  log("я в editnote");
};

export const deleteNote = async (id) => {
  const deletedNote = await fetch(`${location.origin}/dashboard/delete/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
};

export const deleteAllArchived = async (id) => {
  const deletedAll = await fetch(`${location.origin}/dashboard/deleteAll`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
};
export const notePdfUrl = (id) => { };
