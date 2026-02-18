import { useEffect, useState } from 'react'
import './App.css'

import Header from './components/Header'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'
import { sendMessageToOpenAI } from './API'

function App() {

  // 1. Handle Main Page transition to Chat Page
  const [pageToShow, setPageToShow] = useState(true) // false is home; true is chat page
  // 2. Manages messages
  // 2.1. State variables
  const [messages, setMessages] = useState([ // keep adding up messages in the array
    {
      id: "0",
      role: "user",
      content: "How do I build a dashboard?"
    },
    {
      id: "1",
      role: "assistant",
      content: "Start with a clean layout and a robust state!"
    }
  ]);
  // console.log(messages)
  // 2.2 Clear Messages
  function clearChat() {
    setMessages([]);
  }
  // 3. For message is loading control message mismatch (Unused)
  const [isLoading, setIsLoading] = useState(false);

  // 3. Handles both pageToShow and update/add messages
  async function handleMesages(formdata) {

    // 3.1. I will access home page messge here from the form data
    const userInput = formdata.get("messageInput");
    console.log(userInput)

    // 3.2. Validate user data is not empty
    if (!userInput || userInput.trim().length === 0 || isLoading) return;

    // 3.3. Message is loading feature
    setIsLoading(true);
    // 3.3. If not change the page
    setPageToShow(prev => true)

    // 3.4. User input goes in the user messgae
    // Create a unique ID for this specific turn
    const turnId = Date.now();

    setMessages(prev => [...prev,
    {
      id: `user-${turnId}`,
      role: "user",
      content: userInput
    }])

    // Performs API call
    // const response = await sendMessageToOpenAI(userInput);
    const LIMMAGENIE_API_URL = import.meta.env.VITE_LIMMAGENIE_API_URL;
    const response_json = await fetch(`${LIMMAGENIE_API_URL}${userInput}`);
    const data = await response_json.json();
    const response = data.message;
    console.log("API Running")
    console.log(response)
    // const response = "All good response from AI works!"

    // 3. Add Agent Reply to the messages
    setMessages(prev => [...prev, {
      id: `assistant-${turnId}`,
      role: "assistant",
      content: response
    }]);
    setIsLoading(false);
  }



  return (
    <div className='h-dvh w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col overflow-hidden'>
      <Header clearChat={clearChat} />
      {pageToShow ? <ChatPage messages={messages} handleMesages={handleMesages} /> : <HomePage handleMesages={handleMesages} />}

    </div>
  )
}

export default App
