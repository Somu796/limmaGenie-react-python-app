import { useState } from 'react'
import './App.css'

import Header from './components/Header'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'

function App() {

  // Handle Main Page transition to Chat Page
  const [pageToShow, setPageToShow] = useState(false) // false is home; true is chat page
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

  // Function to handle main page for now
  function handleMesages(formdata) {
    // I will access home page messge here from the form data
    const userInput = formdata.get("messageInput")
    console.log(userInput)

    // If not empty perform API call
    // Checkwhere to perform useEffect for API call
    const agentReply = "Something"

    // Only if not empty add in array of messages will help to keep the context
    userInput.length > 0 &&
      setMessages(prevMessages => [...prevMessages,
      {
        id: `${messages.length}`,
        role: "user",
        content: userInput
      }])


    // Change to ChatPage from Home Page
    userInput.length > 0 && setPageToShow(prev => true) // can use both userInput and messages as if greater than 0


  }

  // // Handle Page change
  // function handlePageChange() {
  //   setPageToShow(prev => true)
  // }



  // handles clear chat
  function clearChat() {
    setMessages([]);
  }
  // console.log(messages)

  return (
    <div className='h-dvh w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col overflow-hidden'>
      <Header clearChat={clearChat} />
      {pageToShow ? <ChatPage messages={messages} handleMesages={handleMesages} /> : <HomePage handleMesages={handleMesages} />}

    </div>
  )
}

export default App
