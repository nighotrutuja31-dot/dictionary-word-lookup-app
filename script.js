/* =====================================================
   LEXIFIND - DICTIONARY APP
   FIXED VERSION
===================================================== */

const API_URL =
    "https://api.dictionaryapi.dev/api/v2/entries/en/";

const form = document.getElementById("searchForm");
const input = document.getElementById("wordInput");
const statusBox = document.getElementById("status");
const emptyState = document.getElementById("emptyState");
const result = document.getElementById("result");
const title = document.getElementById("wordTitle");
const phonetic = document.getElementById("phonetic");
const audioButton = document.getElementById("audioButton");
const meaningsContainer = document.getElementById("meaningsContainer");
const extraInfo = document.getElementById("extraInfo");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

let pronunciationUrl = "";


/* =====================================================
   OFFLINE FALLBACK DATA
   This prevents the project from looking broken
   when the API is unavailable.
===================================================== */

const offlineDictionary = {

    behind: {
        word: "behind",
        phonetic: "/bɪˈhaɪnd/",

        meanings: [
            {
                partOfSpeech: "preposition",
                definitions: [
                    {
                        definition:
                            "At or to the far side of something, usually hidden or farther back.",
                        example:
                            "The car is parked behind the house."
                    },
                    {
                        definition:
                            "At a later stage or position than someone or something.",
                        example:
                            "She is behind her classmates in mathematics."
                    }
                ]
            },

            {
                partOfSpeech: "adverb",
                definitions: [
                    {
                        definition:
                            "At or to the back or rear of something.",
                        example:
                            "Please stay behind."
                    }
                ]
            },

            {
                partOfSpeech: "noun",
                definitions: [
                    {
                        definition:
                            "The back or rear part of something.",
                        example:
                            "The garden is at the behind of the building."
                    }
                ]
            }
        ],

        synonyms: [
            "back",
            "rear",
            "after",
            "following"
        ]
    },


    phrase: {
        word: "phrase",
        phonetic: "/freɪz/",

        meanings: [
            {
                partOfSpeech: "noun",
                definitions: [
                    {
                        definition:
                            "A small group of words forming a meaningful unit within a sentence.",
                        example:
                            "She repeated the phrase several times."
                    },
                    {
                        definition:
                            "A brief expression or group of words used to communicate an idea.",
                        example:
                            "That phrase is commonly used in English."
                    }
                ]
            },

            {
                partOfSpeech: "verb",
                definitions: [
                    {
                        definition:
                            "To express something using particular words.",
                        example:
                            "The answer was carefully phrased."
                    }
                ]
            }
        ],

        synonyms: [
            "expression",
            "wording",
            "saying"
        ]
    },


    hello: {
        word: "hello",
        phonetic: "/həˈləʊ/",

        meanings: [
            {
                partOfSpeech: "interjection",
                definitions: [
                    {
                        definition:
                            "Used as a greeting when meeting someone.",
                        example:
                            "Hello! How are you today?"
                    }
                ]
            }
        ],

        synonyms: [
            "greeting",
            "hi"
        ]
    },


    beautiful: {
        word: "beautiful",
        phonetic: "/ˈbjuːtɪfəl/",

        meanings: [
            {
                partOfSpeech: "adjective",
                definitions: [
                    {
                        definition:
                            "Pleasing to the senses or mind aesthetically.",
                        example:
                            "The garden looks beautiful in spring."
                    }
                ]
            }
        ],

        synonyms: [
            "attractive",
            "lovely",
            "pretty"
        ]
    },


    computer: {
        word: "computer",
        phonetic: "/kəmˈpjuːtə/",

        meanings: [
            {
                partOfSpeech: "noun",
                definitions: [
                    {
                        definition:
                            "An electronic device that processes data and performs calculations according to instructions.",
                        example:
                            "I use my computer for programming."
                    }
                ]
            }
        ],

        synonyms: [
            "PC",
            "machine",
            "device"
        ]
    }

};


/* =====================================================
   STATUS
===================================================== */

function showStatus(message, type = "") {

    if (!statusBox) return;

    statusBox.textContent = message;

    statusBox.className =
        `status ${type}`.trim();
}


function hideStatus() {

    if (!statusBox) return;

    statusBox.className =
        "status hidden";
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value = "") {

    return String(value).replace(
        /[&<>"']/g,
        function (character) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];

        }
    );
}


/* =====================================================
   HISTORY
===================================================== */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "lexifindHistory"
            )
        ) || [];

    } catch (error) {

        return [];
    }
}


function saveHistory(word) {

    const history = getHistory();

    const updated = [
        word,
        ...history.filter(
            item => item !== word
        )
    ].slice(0, 8);

    try {

        localStorage.setItem(
            "lexifindHistory",
            JSON.stringify(updated)
        );

    } catch (error) {

        console.log(
            "History could not be saved."
        );
    }

    renderHistory();
}


function renderHistory() {

    if (!historySection || !historyList) {
        return;
    }

    const items = getHistory();

    if (items.length === 0) {

        historySection.classList.add(
            "hidden"
        );

        historyList.innerHTML = "";

        return;
    }

    historySection.classList.remove(
        "hidden"
    );

    historyList.innerHTML =
        items.map(function (word) {

            return `
                <button
                    class="history-item"
                    type="button"
                    data-history-word="${escapeHTML(word)}"
                >
                    ${escapeHTML(word)}
                </button>
            `;

        }).join("");


    document
        .querySelectorAll(
            "[data-history-word]"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const word =
                        button.dataset.historyWord;

                    input.value = word;

                    searchWord(word);
                }
            );

        });
}


/* =====================================================
   AUDIO
===================================================== */

function findPronunciation(data) {

    if (!Array.isArray(data)) {
        return "";
    }

    for (const entry of data) {

        if (
            !entry ||
            !Array.isArray(entry.phonetics)
        ) {
            continue;
        }

        const audio =
            entry.phonetics.find(
                item =>
                    item &&
                    item.audio &&
                    item.audio.trim() !== ""
            );

        if (audio) {
            return audio.audio;
        }
    }

    return "";
}


/* =====================================================
   PHONETIC
===================================================== */

function findPhonetic(data) {

    if (!Array.isArray(data)) {
        return "Pronunciation unavailable";
    }

    for (const entry of data) {

        if (entry.phonetic) {
            return entry.phonetic;
        }

        if (Array.isArray(entry.phonetics)) {

            const item =
                entry.phonetics.find(
                    phonetic =>
                        phonetic &&
                        phonetic.text
                );

            if (item) {
                return item.text;
            }
        }
    }

    return "Pronunciation unavailable";
}


/* =====================================================
   SYNONYMS
===================================================== */

function collectSynonyms(data) {

    const synonyms = [];

    if (!Array.isArray(data)) {
        return synonyms;
    }

    data.forEach(function (entry) {

        if (
            !entry ||
            !Array.isArray(entry.meanings)
        ) {
            return;
        }

        entry.meanings.forEach(
            function (meaning) {

                if (
                    !meaning ||
                    !Array.isArray(
                        meaning.synonyms
                    )
                ) {
                    return;
                }

                meaning.synonyms.forEach(
                    function (word) {

                        if (
                            word &&
                            !synonyms.includes(word)
                        ) {
                            synonyms.push(word);
                        }

                    }
                );

            }
        );

    });

    return synonyms.slice(0, 12);
}


/* =====================================================
   RENDER RESULT
===================================================== */

function renderResult(data, offline = false) {

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {
        showStatus(
            "No dictionary information found.",
            "error"
        );

        return;
    }


    const first = data[0];


    /* WORD */

    title.textContent =
        first.word || "Unknown";


    /* PHONETIC */

    phonetic.textContent =
        findPhonetic(data);


    /* AUDIO */

    pronunciationUrl =
        findPronunciation(data);

    audioButton.classList.toggle(
        "hidden",
        !pronunciationUrl
    );


    /* MEANINGS */

    let meaningsHTML = "";


    data.forEach(function (entry) {

        if (
            !entry ||
            !Array.isArray(entry.meanings)
        ) {
            return;
        }


        entry.meanings.forEach(
            function (meaning) {

                if (
                    !meaning ||
                    !Array.isArray(
                        meaning.definitions
                    )
                ) {
                    return;
                }


                const definitions =
                    meaning.definitions.map(
                        function (definition) {

                            return `
                                <li>

                                    <div>
                                        ${escapeHTML(
                                            definition.definition ||
                                            "Definition unavailable."
                                        )}
                                    </div>

                                    ${
                                        definition.example
                                            ? `
                                                <div class="example">
                                                    “${escapeHTML(
                                                        definition.example
                                                    )}”
                                                </div>
                                              `
                                            : ""
                                    }

                                </li>
                            `;

                        }
                    ).join("");


                meaningsHTML += `
                    <article class="meaning">

                        <span class="part-of-speech">
                            ${escapeHTML(
                                meaning.partOfSpeech ||
                                "meaning"
                            )}
                        </span>

                        <ol class="definition-list">
                            ${definitions}
                        </ol>

                    </article>
                `;

            }
        );

    });


    meaningsContainer.innerHTML =
        meaningsHTML;


    /* SYNONYMS */

    let synonyms =
        collectSynonyms(data);


    /*
       Offline data contains synonyms
       separately, so use them if available.
    */

    const originalWord =
        String(first.word || "")
            .toLowerCase();


    if (
        synonyms.length === 0 &&
        offlineDictionary[originalWord]
    ) {

        synonyms =
            offlineDictionary[
                originalWord
            ].synonyms || [];

    }


    extraInfo.innerHTML = `

        <div class="extra-card">

            <h4>
                Synonyms
            </h4>

            <p>
                ${
                    synonyms.length
                        ? synonyms
                            .map(
                                word =>
                                    escapeHTML(word)
                            )
                            .join(" · ")
                        : "No synonyms available."
                }
            </p>

        </div>


        <div class="extra-card">

            <h4>
                Source
            </h4>

            <p>
                ${
                    offline
                        ? "LexiFind offline fallback data"
                        : "Free Dictionary API"
                }
            </p>

        </div>

    `;


    /* SHOW RESULT */

    emptyState.classList.add(
        "hidden"
    );

    result.classList.remove(
        "hidden"
    );
}


/* =====================================================
   GET OFFLINE DATA
===================================================== */

function getOfflineData(word) {

    const item =
        offlineDictionary[word];

    if (!item) {
        return null;
    }


    return [
        {
            word: item.word,
            phonetic: item.phonetic,
            meanings: item.meanings
        }
    ];
}


/* =====================================================
   API REQUEST
===================================================== */

async function fetchDictionaryData(word) {

    const controller =
        new AbortController();


    /*
       Increased timeout from 10 sec
       to 20 sec.
    */

    const timeout =
        setTimeout(
            function () {
                controller.abort();
            },
            20000
        );


    try {

        const response =
            await fetch(
                API_URL +
                encodeURIComponent(word),
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    signal:
                        controller.signal
                }
            );


        clearTimeout(timeout);


        if (response.status === 404) {

            return {
                success: false,
                type: "not-found"
            };
        }


        if (!response.ok) {

            return {
                success: false,
                type: "server-error"
            };
        }


        const data =
            await response.json();


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            return {
                success: false,
                type: "not-found"
            };
        }


        return {
            success: true,
            data: data
        };


    } catch (error) {

        clearTimeout(timeout);


        console.error(
            "Dictionary API error:",
            error
        );


        if (
            error.name ===
            "AbortError"
        ) {

            return {
                success: false,
                type: "timeout"
            };
        }


        return {
            success: false,
            type: "network"
        };
    }
}


/* =====================================================
   MAIN SEARCH FUNCTION
===================================================== */

async function searchWord(rawWord) {

    const word =
        rawWord
            .trim()
            .toLowerCase();


    /* EMPTY */

    if (!word) {

        showStatus(
            "Please enter a word to search.",
            "error"
        );

        input.focus();

        return;
    }


    /* VALIDATION */

    if (
        !/^[a-zA-ZÀ-ÿ'-]+$/.test(word)
    ) {

        showStatus(
            "Please enter a valid English word.",
            "error"
        );

        return;
    }


    /* LOADING */

    showStatus(
        `Looking up "${word}"...`,
        "loading"
    );


    result.classList.add(
        "hidden"
    );


    /* =================================================
       FIRST: CHECK OFFLINE DATA
       This makes the app reliable for demonstration.
    ================================================= */

    const offlineData =
        getOfflineData(word);


    if (offlineData) {

        /*
           Give the live API a chance first.
        */

        const apiResult =
            await fetchDictionaryData(word);


        if (apiResult.success) {

            renderResult(
                apiResult.data,
                false
            );

            saveHistory(
                apiResult.data[0].word ||
                word
            );

            input.value =
                apiResult.data[0].word ||
                word;

            hideStatus();

            return;
        }


        /*
           API failed -> show offline data.
        */

        renderResult(
            offlineData,
            true
        );

        saveHistory(word);

        input.value = word;


        showStatus(
            "Live API is unavailable. Showing built-in dictionary data.",
            "loading"
        );

        return;
    }


    /* =================================================
       NORMAL API SEARCH
    ================================================= */

    const apiResult =
        await fetchDictionaryData(word);


    if (apiResult.success) {

        renderResult(
            apiResult.data,
            false
        );

        saveHistory(
            apiResult.data[0].word ||
            word
        );

        input.value =
            apiResult.data[0].word ||
            word;

        hideStatus();

        return;
    }


    /* NOT FOUND */

    if (
        apiResult.type ===
        "not-found"
    ) {

        showStatus(
            `We couldn't find "${word}". Check the spelling and try another word.`,
            "error"
        );

        return;
    }


    /* TIMEOUT */

    if (
        apiResult.type ===
        "timeout"
    ) {

        showStatus(
            "The dictionary server took too long to respond. Please try again.",
            "error"
        );

        return;
    }


    /* SERVER ERROR */

    if (
        apiResult.type ===
        "server-error"
    ) {

        showStatus(
            "The dictionary server is temporarily unavailable. Please try again later.",
            "error"
        );

        return;
    }


    /* NETWORK ERROR */

    showStatus(
        "Unable to connect to the dictionary API. Please check your internet connection.",
        "error"
    );
}


/* =====================================================
   FORM SUBMIT
===================================================== */

if (form) {

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            searchWord(
                input.value
            );

        }
    );
}


/* =====================================================
   AUDIO BUTTON
===================================================== */

if (audioButton) {

    audioButton.addEventListener(
        "click",
        function () {

            if (!pronunciationUrl) {
                return;
            }


            const audio =
                new Audio(
                    pronunciationUrl
                );


            audio.play()
                .catch(
                    function () {

                        showStatus(
                            "Pronunciation audio could not be played.",
                            "error"
                        );

                    }
                );

        }
    );
}


/* =====================================================
   QUICK SEARCH WORDS
===================================================== */

document
    .querySelectorAll(
        "[data-word]"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const word =
                        button.dataset.word;

                    input.value =
                        word;

                    searchWord(
                        word
                    );

                }
            );

        }
    );


/* =====================================================
   CLEAR HISTORY
===================================================== */

if (clearHistoryButton) {

    clearHistoryButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "lexifindHistory"
            );

            renderHistory();

        }
    );
}


/* =====================================================
   INITIALIZE
===================================================== */

renderHistory();

console.log(
    "LexiFind Dictionary App started successfully."
);