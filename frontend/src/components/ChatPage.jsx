import React, { useState } from "react";
import MessageInput from "./MessgeInput";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/a11y-light.css';



import { useRef, useEffect } from "react";

function ChatPage(props) {
    // const parts = splitCodeFromText(message.content);
    const messagesEndRef = useRef(null);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [props.messages]);

    return (
        // <main
        //     className={`p-4 max-w-[80%] rounded-2xl`}
        // // className={`p-4 max-w-[80%] rounded-2xl ${message.role === "user"
        // //     ? "bg-gray-100 rounded-tr-none"
        // //     : "bg-blue-50 rounded-tl-none"
        // //     }`}
        // >
        <main className="h-dvh w-full bg-white max-w-4xl mx-auto flex flex-col justify-center overflow-hidden px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">limmaGenie</h1>
                <p className="text-gray-600">
                    Ask me anything about{" "}
                    <a
                        href="https://doi.org/10.1093/nar/gkv007"
                        className="text-blue-400 hover:text-blue-700 font-medium"
                    >
                        limma
                    </a>{" "}
                    analysis!
                </p>
            </div>

            {/* Chat Messages */}
            <div className="space-y-6 overflow-y-auto max-h-[60vh] p-4 pb-20">
                {
                    props.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`p-4 max-w-[80%] rounded-2xl ${msg.role === "user"
                                    ? "bg-blue-500 text-white rounded-tr-none" // User bubble (usually blue/dark)
                                    : "bg-gray-100 text-gray-800 rounded-tl-none" // AI bubble (usually light)
                                    }`}
                            >
                                <div className={`prose prose-sm max-w-none 
        prose-pre:!bg-transparent prose-pre:p-0 prose-pre:my-4
        ${msg.role === "user" ? "prose-invert" : "text-gray-800"}`}>
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            {/* <ChatMessage message={msg.id.content} /> */}

                        </div>))
                }
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg z-10">
                <div className="container mx-auto max-w-4xl">
                    <MessageInput handleMesages={props.handleMesages} />
                </div>
            </div>
        </main>

        // </main >
    );
}


export default ChatPage;




// import React, { useState, useEffect, useRef } from "react";
// import { useLocation } from "react-router-dom";
// import Header from "../components/Header";
// import MessageInput from "../components/MessageInput";
// import ChatMessage from "../components/ChatMessage";
// import { sendMessageToOpenAI } from "../api";

/**
 * ChatInterfacePage Component
 * Handles the chat interface and interactions with the OpenAI API.
 */
// const ChatInterfacePage = () => {
//   const location = useLocation();
//   const initialMessage = location.state?.initialMessage || "";
//   const [messages, setMessages] = useState([]);
//   const messagesEndRef = useRef(null);

//   // Scroll to the bottom of the chat messages container
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Scroll to bottom whenever messages change
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Simulate typing effect for AI responses
//   const simulateTyping = (response) => {
//     if (!response) return;

//     const words = response.split(" ");
//     let index = 0;
//     const typingSpeed = 200; // Delay between each word (in ms)

//     const intervalId = setInterval(() => {
//       setMessages((prev) => {
//         const newMessages = [...prev];
//         const newMessage = newMessages[newMessages.length - 1];
//         newMessage.content = newMessage.content
//           ? newMessage.content + " " + words[index]
//           : words[index];
//         return newMessages;
//       });

//       setTimeout(scrollToBottom, 0);
//       index++;
//       if (index === words.length) clearInterval(intervalId);
//     }, typingSpeed);
//   };

//   // Fetch AI response when the page loads with an initial message
//   useEffect(() => {
//     if (initialMessage) {
//       const userMessage = { role: "user", content: initialMessage };
//       setMessages([userMessage]);

//       sendMessageToOpenAI(initialMessage)
//         .then((response) => {
//           if (response) {
//             setMessages((prev) => [
//               ...prev,
//               { role: "assistant", content: "" },
//             ]);
//             simulateTyping(response);
//           } else {
//             setMessages((prev) => [
//               ...prev,
//               { role: "assistant", content: "Sorry, I couldn't understand." },
//             ]);
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching AI response:", error);
//           setMessages((prev) => [
//             ...prev,
//             { role: "assistant", content: "Sorry, something went wrong!" },
//           ]);
//         });
//     }
//   }, [initialMessage]);

//   // Handle sending a new message
//   const handleNewMessage = async (message) => {
//     setMessages((prev) => [...prev, { role: "user", content: message }]);
//     const response = await sendMessageToOpenAI(message);
//     console.log(response);
//     setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
//     simulateTyping(response);
//   };

//   // Clear the chat history
//   const clearChat = () => {
//     setMessages([]);
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-[1440px] mx-auto px-8">
//         <Header clearChat={clearChat} />
//         <main className="container mx-auto px-4 py-8 max-w-4xl">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold mb-2">limmaGenie</h1>
//             <p className="text-gray-600">
//               Ask me anything about limma analysis!
//             </p>
//           </div>

//           {/* Chat Messages */}
//           <div className="space-y-6 overflow-y-auto max-h-[60vh] p-4 pb-20">
//             {messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   msg.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <ChatMessage message={msg} />
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input Area */}
//           <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg z-10">
//             <div className="container mx-auto max-w-4xl">
//               <MessageInput onMessageSent={handleNewMessage} />
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ChatInterfacePage;


//  I think after api call I am dividing it into two parts text and code in blocks but I guess just rendering md as chat should work
// function splitCodeFromText(text) {
//     const regex = /```(\w+)?\s*([\s\S]+?)```|([\s\S]+?(?=```|$))/g;
//     const parts = [];
//     let lastIndex = 0;

//     while (true) {
//         const match = regex.exec(text);
//         if (!match) break;

//         if (match[2]) {
//             if (match.index > lastIndex) {
//                 parts.push({
//                     isCode: false,
//                     text: text.substring(lastIndex, match.index),
//                 });
//             }
//             parts.push({
//                 isCode: true,
//                 text: match[2],
//                 language: match[1] || undefined,
//             });
//             lastIndex = regex.lastIndex;
//         } else if (match[3]) {
//             parts.push({ isCode: false, text: match[3] });
//             lastIndex = regex.lastIndex;
//         }
//     }

//     return parts;
// };

// /**
//  * CodeBlock Component
//  * Displays a code block with a copy button.
//  */
// const CodeBlock = ({ text, language }) => {
//     const [copied, setCopied] = useState(false);

//     const handleCopy = () => {
//         navigator.clipboard.writeText(text);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     return (
//         <div className="relative my-2 bg-gray-800 text-white font-mono rounded-lg overflow-hidden">
//             <div className="flex justify-between items-center p-2 bg-gray-700">
//                 {language && <span className="text-xs text-gray-300">{language}</span>}
//                 <button
//                     onClick={handleCopy}
//                     className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
//                 >
//                     {copied ? "Copied!" : "Copy"}
//                 </button>
//             </div>
//             <pre className="p-3 overflow-x-auto">
//                 <code>{text}</code>
//             </pre>
//         </div>
//     );
// };
