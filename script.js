let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
const output = document.getElementById("output"); 
let speechSynthesisInstance = window.speechSynthesis;
let speaking = false;

function speak(text, updateOutput = true) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "en-US";

    if (updateOutput) {
        output.value = text; // Update the textbox with the spoken text
    }

    speaking = true; // Set speaking to true

    text_speak.onend = () => {
        speaking = false; 
        // btn.innerText = "Talk to Alpha"; // Reset button text after speaking
        voice.style.display = "none";
        btn.style.display = "flex";
    };

    window.speechSynthesis.speak(text_speak);
}

// Button click event listener
btn.addEventListener("click", () => {
    if (speaking) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
        speaking = false;
    }
    
    output.value = ""; // Clear the textbox
    voice.style.display = "flex"; // Example: Show a visual indicator (if needed)
    
    // Call your speech recognition or handling logic here
});


function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak(" Hello,Good Morning, Have a good day", false);
    } else if (hours >= 12 && hours < 16) {
        speak(" Hello,Good Afternoon, How's your day going on..", false);
    } else {
        speak(" Hello,Good Evening, How did you do today", false);
    }
}


async function fetchWikipediaResults(query) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(query)}`;

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
                    link: `https://en.wikipedia.org/?curid=${pageId}`
                };
            }
        }

        return null;
    } catch (error) {
        console.error("Wikipedia API Error:", error);
        return null;
    }
}
async function fetchGoogleSearchResults(query) {
    const API_KEY = 'AIzaSyAqZYua8IdYayFu1jbgBEaLTz9qv10aYsU'; // Replace with your Google API key
    const CX = 'a78388551492c4f3b'; // Replace with your Custom Search Engine ID
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${CX}`;

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
            speak(`${title}: ${summary}`);
            output.innerHTML = `
    <b>${title}</b><br><br>
    ${summary}<br><br>
    <a href="${link}" target="_blank">Read more</a>
`;

        } else {
            speak("Sorry, I couldn't find detailed information about this topic.");
        }
        return;
    }

    speak("Sorry, I don't understand this command. Can you try asking something else?");
}

window.addEventListener('load', () => {
    wishMe();
});

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    let transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
    content.innerText = transcript;
    takeCommand(transcript);
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
    if (speaking) {
        speechSynthesisInstance.cancel(); // Stop speaking
        speaking = false; // Reset speaking state
        output.value = ""; // Clear output text
    }
    else{
        recognition.start();
        voice.style.display = "block"; // Show the voice indicator
        btn.style.display = "none";
    }
});

const commands = {
    hello: () => speak("Hello, what can I help you with?"),
    "who are you": () => speak("I am a virtual assistant."),
    "how are you": () => speak("I am fine, what about you?"),
    "i am fine": () => speak("Good to hear! How can I assist you today?"),
    "good morning": () => speak("Good Morning! How can I help you?"),
    "good afternoon": () => speak("Good Afternoon! How can I help you?"),
    "good evening": () => speak("Good Evening! How can I help you?"),
    "what is your name": () => speak("I am your virtual assistant Alpha"),
    "who created you": () => speak("I was created by group of students."),
    "what can you do": () => speak("I can assist you with reminders, opening apps, answering queries, and providing helpful information."),
    "thank you": () => speak("You're welcome! I'm here to help."),
    "what is ai": () => speak("AI, or Artificial Intelligence, is the simulation of human intelligence by machines."),
    "what is machine learning": () => speak("Machine learning is a branch of AI that involves training machines to learn from data."),
    "tell me a joke": () => speak("Why don’t skeletons fight each other? They don’t have the guts."),
    "tell me a fact": () => speak("Did you know? Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3000 years old and still edible."),
    "what is your favorite colour": () => speak("I like all colors equally, but blue seems calming."),
    "how old are you": () => speak("I exist in the digital realm, so I don't age like humans."),
    "can you dance": () => speak("I can’t dance, but I can play music for you!"),
    "sing a song": () => speak("La la la! Sorry, I can't sing, but I can find a song for you."),
    "how do you work": () => speak("I work by understanding your voice commands and executing predefined tasks or fetching relevant information."),
    "what is your purpose": () => speak("My purpose is to assist you with tasks and provide helpful information."),
    "can you cook": () => speak("I can't cook, but I can find recipes for you!"),
    "where are you from": () => speak("I live in your device's memory and in the cloud."),
    "what is the meaning of life": () => speak("42. Just kidding! Life is what you make of it."),
    "who is your favorite celebrity": () => speak("I admire all talented individuals equally."),
    "goodbye": () => speak("Goodbye! Have a great day ahead."),
    "open youtube": () => {
        speak("Opening YouTube...");
        window.open("https://youtube.com/", "_blank");
    },
    "open google": () => {
        speak("Opening Google...");
        window.open("https://google.com/", "_blank");
    },
    "open facebook": () => {
        speak("Opening Facebook...");
        window.open("https://facebook.com/", "_blank");
    },
    "open instagram": () => {
        speak("Opening Instagram...");
        window.open("https://instagram.com/", "_blank");
    },
    "open calculator": () => {
        speak("Opening calculator...");
        window.open("calculator://");
    },
    "open whatsapp": () => {
        speak("Opening WhatsApp...");
        window.open("whatsapp://");
    },
    "what is the time": () => {
        let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak(`The time is ${time}`);
    },
    "what is the date": () => {
        let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" });
        speak(`Today's date is ${date}`);
    },
    setreminder: (message) => {
        let reminderTime = message.replace("set reminder at", "").trim();  // Extract time from message
        if (!reminderTime) {
            speak("Please specify the time for the reminder.");
            return;
        }
    
        // Convert 12-hour format to 24-hour format
        let isPM = reminderTime.toLowerCase().includes("pm");
        let isAM = reminderTime.toLowerCase().includes("am");
        let timeParts = reminderTime.replace(/(am|pm)/i, "").trim().split(":");
    
        if (timeParts.length !== 2) {
            speak("Please provide a valid time in the format HH:MM AM/PM.");
            return;
        }
    
        let hours = parseInt(timeParts[0]);
        let minutes = parseInt(timeParts[1]);
    
        // Adjust hours based on AM/PM
        if (isPM && hours < 12) {
            hours += 12;  // Convert PM time to 24-hour format
        } else if (isAM && hours === 12) {
            hours = 0;  // Convert 12 AM to 00 hours
        }
    
        let now = new Date();
        let reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    
        // If the reminder time has already passed for today, set it for the next day
        if (reminderDate < now) {
            reminderDate.setDate(reminderDate.getDate() + 1);
        }
    
        let timeUntilReminder = reminderDate - now;
    
        // Store the reminder in localStorage
        localStorage.setItem('reminder', JSON.stringify({ time: reminderDate }));
    
        // Notify user
        speak(`Reminder set for ${reminderTime}. I will notify you then.`);
    
        // Set the timeout to open the online alarm clock and notify the user
        setTimeout(() => {
            // Open online alarm clock
            
    
            // Trigger virtual assistant voice
            speak("It's time for your reminder!");
    
            // Show a browser notification
            new Notification("Reminder", { body: "It's time!" });
    
            // Play sound continuously after reminder is triggered
            let audio = new Audio('./reminder.mp3');  // You can use any sound URL or local sound file
            audio.loop = true;  // Set the audio to loop continuously
            audio.play();  // Play the sound
    
            // Stop the sound when the user acknowledges (this can be done by a button click or any other interaction)
            const stopSoundButton = document.createElement('button');
            stopSoundButton.innerText = 'Stop Sound';
            stopSoundButton.style.position = 'fixed';
            stopSoundButton.style.top = '10px';
            stopSoundButton.style.right = '10px';
            document.body.appendChild(stopSoundButton);
    
            stopSoundButton.addEventListener('click', () => {
                audio.pause();  // Stop the sound
                audio.currentTime = 0;  // Reset sound to the start
                document.body.removeChild(stopSoundButton);  // Remove the stop button
                speak("Sound stopped. How can I assist you further?");
            });
        }, timeUntilReminder);
    },

    temperature: async (message) => {
        let location = message.replace("what is temperature in", "").trim();  // Extract location from message
        if (!location) {
            speak("Please specify the location for which you need the temperature.");
            return;
        }

        const apiKey = "AIzaSyAqZYua8IdYayFu1jbgBEaLTz9qv10aYsU";  // WeatherStack API key
        const weatherUrl = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${encodeURIComponent(location)}`;

        console.log("Weather URL: ", weatherUrl);  // Log URL for debugging

        try {
            let response = await fetch(weatherUrl);
            console.log("Response status: ", response.status);  // Log response status for debugging

            if (!response.ok) {
                speak(`Sorry, I couldn't find weather data for ${location}. Please try another location.`);
                return;
            }

            let data = await response.json();
            console.log("Weather data: ", data);  // Log data for debugging

            // Check if the location data is found
            if (data.error) {
                speak(`Sorry, I couldn't find weather data for ${location}. Please check the location and try again.`);
                return;
            }

            let temp = data.current.temperature;
            let description = data.current.weather_descriptions[0];
            speak(`The current temperature in ${location} is ${temp}°C with ${description}.`);
        } catch (error) {
            console.error("Weather API Error:", error);
            speak("Sorry, I couldn't fetch the weather data. Please try again later.");
        }
    },
    calculate: (message) => {
        try {
            // Clean up the message by removing the word "calculate" and trimming spaces
            const expression = message.replace('calculate', '').trim();
    
            console.log("Expression:", expression);  // Debugging: Check the expression to evaluate
    
            if (expression) {
                const result = eval(expression);  // Evaluates the mathematical expression
                console.log("Result:", result);  // Debugging: Check the result before speaking
    
                speak(`The result is ${result}`);
            } else {
                speak("Please provide a valid expression to calculate.");
            }
        } catch (error) {
            console.error("Error in calculation:", error);  // Debugging: Log errors
            speak("There was an error in calculating the expression.");
        }
    },    
    
    play: async (message) => {
        let query = message.replace("play", "").trim();
        if (query) {
            speak(`Searching for ${query} on YouTube...`);
            const apiKey = "AIzaSyDlX_l3Fbln7w5S7elXOQPOwA1ujD6EDv8"; // Replace with your actual API key
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=1`;

            try {
                let response = await fetch(searchUrl);
                let data = await response.json();

                if (data.items && data.items.length > 0) {
                    let videoId = data.items[0].id.videoId;
                    let videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    speak(`Playing ${query} on YouTube.`);
                    window.open(videoUrl, "_blank"); // Open the video directly
                } else {
                    speak("No video found for your query.");
                }
            } catch (error) {
                console.error("YouTube API Error:", error);
                speak("Sorry, I couldn't fetch the video. Please try again later.");
            }
        } else {
            speak("Please specify what you want to play.");
        }
    },
};
function takeCommand(message) {

    voice.style.display = "none";

    btn.style.display = "flex";

    // Check for set reminder command

    if (message.includes("set reminder at")) {

        commands.setreminder(message);

        return;

    }
    // Check for specific commands

    for (const key in commands) {

        if (message.includes(key)) {

            commands[key](message); // Execute the command function

            return;

        }

    }
    // Default fallback: Handle general queries

    if (

        message.startsWith("what is") ||

        message.startsWith("tell me about") ||

        message.startsWith("why") ||

        message.startsWith("where") ||
        
        message.startsWith("how") ||

        message.startsWith("do") ||

        message.startsWith("can") ||

        message.startsWith("when")

    ) {
        processCommand(message); // Call the Wikipedia/Google query processor

        return;

    }
    // If no match found

    speak("Sorry, I don't understand this command. Can you try asking something else?");

}

// Function to stop any ongoing speech
function stopSpeechOnUnload() {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel(); // Stops any ongoing speech
    }
}

// Attach the event listener to stop speech when the page is refreshed or closed
window.addEventListener("beforeunload", stopSpeechOnUnload);
