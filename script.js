const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
const API_KEY = "sk-proj-fyuTd3ZxJst3Yj00zIsk-AgxP8FPsDSVkO6Qi0jWET3BlbkFJNzEgnTzmwMp5WW94N9R4";
const RETRIEVE_DATA_URL = "retrieve_data.php";

const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">quick_phrases</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").innerHTML = message;
    chatLi.style.marginBottom = "10px";
    return chatLi;
}

const generateResponse = (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    const API_URL = "https://api.openai.com/v1/chat/completions";
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        })
    };

    fetch(API_URL, requestOptions)
    .then(res => res.json())
    .then(data => {
        messageElement.textContent = data.choices[0].message.content.trim();
    })
    .catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    })
    .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};

const handlePersonalChat = () => {
    chatbox.innerHTML = "";
    chatbox.appendChild(createChatLi("Hi there! To provide personalized information, please enter your UniqueID:", "incoming"));
    chatbox.appendChild(createChatLi("<input type='text' id='uniqueIDInput' style='padding: 5px; width:120px;'>&nbsp;&nbsp;&nbsp;<button onclick='submitUniqueID()' style='background-color: purple;border-radius:30px; color: white; padding: 8px 12px; border: none; border-radius:10px; cursor: pointer;'>Submit</button>", "incoming"));

    window.submitUniqueID = () => {
        const uniqueID = document.getElementById("uniqueIDInput").value;

        if (uniqueID.trim() !== "") {
            chatbox.appendChild(createChatLi("Fetching data...", "incoming"));

            fetch(RETRIEVE_DATA_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `uniqueID=${uniqueID}`,
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data); // Debug statement

                if (data.error) {
                    chatbox.appendChild(createChatLi(data.error, "incoming"));
                } else {
                    chatbox.appendChild(createChatLi(`Employee ID: ${data.empid}<br>Name: ${data.name}<br>Department: ${data.dpt}<br>Location: ${data.location}`, "incoming"));

                    console.log(data.agreement); // Debug statement

                    if (data.agreement) {
                        console.log('Creating download button'); // Debug statement

                        const downloadButton = document.createElement('button');
                        downloadButton.textContent = 'Download Agreement PDF';
                        downloadButton.style.backgroundColor = 'purple';
                        downloadButton.style.color = 'white';
                        downloadButton.style.padding = '8px 12px';
                        downloadButton.style.border = 'none';
                        downloadButton.style.borderRadius = '10px';
                        downloadButton.style.cursor = 'pointer';

                        downloadButton.addEventListener('click', () => {
                            const pdfBlob = base64toBlob(data.agreement, 'application/pdf');
                            const downloadLink = document.createElement('a');
                            downloadLink.href = URL.createObjectURL(pdfBlob);
                            downloadLink.download = 'employee_agreement.pdf';
                            downloadLink.click();
                        });

                        chatbox.appendChild(downloadButton);
                    }
                }
            })
            .catch(() => {
                chatbox.lastChild.classList.add("error");
                chatbox.lastChild.textContent = "Oops! Something went wrong. Please try again.";
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
        } else {
            chatbox.appendChild(createChatLi("Please enter a valid UniqueID.", "incoming"));
        }
    };

    document.getElementById("uniqueIDInput").focus();
};

const handleGeneralQueries = () => {
    chatbox.innerHTML = "";
    chatbox.appendChild(createChatLi("Hi there! How can I assist you today?", "incoming"));
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Zippy is typing...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        if (userMessage.toLowerCase().includes("personal chat") || userMessage.toLowerCase().includes("employee details")) {
            handlePersonalChat();
        } else if (userMessage.toLowerCase().includes("general queries")) {
            handleGeneralQueries();
        } else {
            generateResponse(incomingChatLi);
        }
    }, 600);
};

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

document.getElementById("personalChatBtn").addEventListener("click", handlePersonalChat);
document.getElementById("generalQueriesBtn").addEventListener("click", handleGeneralQueries);

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}
