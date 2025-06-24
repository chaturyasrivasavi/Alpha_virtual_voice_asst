let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let output = document.querySelector("#output");

// Speak function to handle text-to-speech output
function speak(text, updateOutput = true) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "en-US";

    if (updateOutput) {
        output.value = text;
    }

    window.speechSynthesis.speak(text_speak);
}

// Speech recognition setup
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    let transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
    content.innerText = transcript;
    processCommand(transcript);
};

recognition.onerror = (event) => {
    console.error("Speech Recognition Error: ", event.error);
    content.innerText = "Error occurred: " + event.error;
};

recognition.onstart = () => {
    voice.style.display = "block";
    btn.style.display = "none";
};

recognition.onend = () => {
    voice.style.display = "none";
    btn.style.display = "flex";
};

btn.addEventListener("click", () => {
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
});

// Fetch information from Wikipedia API
async function fetchWikipediaResults(query) {
    const url = https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(query)};

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Wikipedia API Error");
        const data = await response.json();
        const pages = data.query.pages;

        for (let pageId in pages) {
            const page = pages[pageId];
            if (page.extract) {
                return {
                    title: page.title,
                    snippet: page.extract,
                    link: https://en.wikipedia.org/?curid=${pageId}
                };
            }
        }

        return null;
    } catch (error) {
        console.error("Wikipedia API Error:", error);
        return null;
    }
}

// Fetch information from Google Custom Search API
async function fetchGoogleSearchResults(query) {
    const API_KEY = 'AIzaSyAqZYua8IdYayFu1jbgBEaLTz9qv10aYsU'; // Replace with your Google API key
    const CX = 'a78388551492c4f3b'; // Replace with your Custom Search Engine ID
    const url = https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${CX};

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Google Search API Error");
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const firstResult = data.items[0];
            return {
                title: firstResult.title,
                snippet: firstResult.snippet,
                link: firstResult.link
            };
        }
        return null;
    } catch (error) {
        console.error("Google Search API Error:", error);
        return null;
    }
}

// Summarize snippets to ensure full summary without cutting off or truncating mid-sentence
function summarizeSnippet(snippet) {
    let trimmedSnippet = snippet.trim();

    // If the snippet is too short, provide a more general message
    if (trimmedSnippet.length < 100) {
        return "This topic has limited information available. Here's a brief overview.";
    }

    // Ensure we trim the snippet and avoid sentences being cut off in the middle
    const endOfSentence = trimmedSnippet.search(/[.!?]/);
    if (endOfSentence !== -1) {
        trimmedSnippet = trimmedSnippet.substring(0, endOfSentence + 1);
    }

    return trimmedSnippet;
}

// Process commands related to programming topics or general queries
async function processCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.startsWith("what is") || message.startsWith("tell me about") || message.startsWith("why") || message.startsWith("how") || message.startsWith("when")) {
        const topic = message.replace("what is", "").replace("tell me about", "").trim();

        // First, attempt to fetch the result from Wikipedia
        let result = await fetchWikipediaResults(topic);

        // If Wikipedia didn't return a result, fall back to Google
        if (!result) {
            result = await fetchGoogleSearchResults(topic);
        }

        // Process and speak the result
        if (result) {
            const { title, snippet, link } = result;
            const summary = summarizeSnippet(snippet);
            speak(${title}: ${summary});
            output.value = ${title}\n\n${summary}\n\nRead more: ${link};
        } else {
            speak("Sorry, I couldn't find detailed information about this topic.");
        }
        return;
    }

    speak("Sorry, I don't understand this command. Can you try asking something else?");
}