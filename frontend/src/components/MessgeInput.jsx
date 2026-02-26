// import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

/**
 * MessageInput Component
 * Handles user input for sending messages.
 */
function MessageInput({ handleMessages }) {


    return (
        <form className="relative shadow-md" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleMessages(formData);
            e.target.reset(); // clears the input immediately
        }} >
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