// import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

/**
 * MessageInput Component
 * Handles user input for sending messages.
 */
// function MessageInput({ onMessageSent }) {
//     const [message, setMessage] = useState("");

//     // Handle form submission
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!message.trim()) return; // Ignore empty messages
//         onMessageSent(message);
//         setMessage("");
//     };

//     return (
//         <form onSubmit={handleSubmit} className="relative">
//             <div className="relative shadow-md">
//                 <input
//                     type="text"
//                     id="messageInput"
//                     name="messageInput"
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     placeholder="Message limmaGenie"
//                     className="w-full px-6 py-4 pr-12 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 font-medium"
//                 />
//                 <button
//                     type="submit"
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
//                     disabled={!message.trim()}
//                 >
//                     <FontAwesomeIcon icon={faArrowUp} className="text-xl" />
//                 </button>
//             </div>
//         </form>
//     );
// };

// export default MessageInput;


function MessageInput({ handleMesages }) {


    return (
        <form className="relative shadow-md" action={handleMesages} >
            <input
                id="messageInput"
                name="messageInput"
                placeholder="Message limmaGenie"
                className="w-full px-6 py-4 pr-12 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 font-medium"
            />
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
            >
                <FontAwesomeIcon icon={faArrowUp} className="text-xl" />
            </button>
        </form>
    );
};

export default MessageInput;