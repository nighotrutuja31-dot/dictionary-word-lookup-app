# LexiFind - Dictionary and Word Lookup App

A modern and responsive Dictionary and Word Lookup App built using HTML, CSS and JavaScript.

The application uses the Free Dictionary API to provide word definitions, phonetics, examples, synonyms and pronunciation audio.

---

## 📌 Project Information

### Project Name

LexiFind - Dictionary and Word Lookup App

### Task

Task 28 - Dictionary and Word Lookup App

### Technologies

- HTML5
- CSS3
- JavaScript
- Fetch API
- LocalStorage
- Free Dictionary API

---

# 🚀 Features

## 1. Word Search

Users can enter an English word in the search box and retrieve its dictionary information.

---

## 2. Definitions

The application displays definitions received from the Free Dictionary API.

---

## 3. Multiple Meanings

If a word has multiple meanings, they are displayed separately.

---

## 4. Part of Speech

Meanings are grouped according to their part of speech.

Examples:

- Noun
- Verb
- Adjective
- Adverb

---

## 5. Phonetics

The application displays the phonetic pronunciation when available.

---

## 6. Audio Pronunciation

If the API provides an audio pronunciation URL, the application displays an audio button.

Users can click the button to listen to the pronunciation.

---

## 7. Example Sentences

Example sentences are displayed under the corresponding definition when available.

---

## 8. Synonyms

The application collects available synonyms from the API response.

---

## 9. Error Handling

The application handles:

- Empty search
- Word not found
- API errors
- Internet connection problems
- Missing pronunciation audio

---

## 10. Search History

Recently searched words are stored using browser LocalStorage.

Users can:

- View recent searches
- Search again by clicking a previous word
- Clear the complete search history

---

# 📂 Project Structure

```text
dictionary-word-lookup-app/
│
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore