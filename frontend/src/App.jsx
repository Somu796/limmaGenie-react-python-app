import { useEffect, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import HomePage from "./components/HomePage";
import ChatPage from "./components/ChatPage";
import { sendMessageToOpenAI } from "./API";

function App() {
  // 1. Handle Main Page transition to Chat Page # Should work
  const [pageToShow, setPageToShow] = useState(false); // false is home; true is chat page
  // 2. Manages messages
  // 2.1. State variables
  const [messages, setMessages] = useState([
    // keep adding up messages in the array
    // {
    //   id: "0",
    //   role: "user",
    //   content: "How do I build a dashboard?"
    // },
    // {
    //   id: "1",
    //   role: "assistant",
    //   content: "To perform a limma analysis for a 2x2x2 factorial design, you need to manage three categorical factors. To achieve this, you can combine these factors into a single variable and then create a design matrix for the analysis. Here's a step-by-step guide along with the R code required:\n\n1. **Combine the Factors**: Start by combining your three factors into a single grouping variable. If your factors are named `factor1`, `factor2`, and `factor3`, you can combine them as follows:\n\n   ```r\n   group <- paste(factor1, factor2, factor3, sep = \"_\")\n   ```\n\n   This line of code creates a new variable `group` where each level corresponds to unique combinations of the three factors.\n\n2. **Create the Design Matrix**: Once you have the combined factor, you need to create a design matrix that will be used for the limma analysis. You can do this using the `model.matrix` function:\n\n   ```r\n   design <- model.matrix(~ group)\n   ```\n\n   This command generates a matrix that will be used to model the relationship between the combined factors and the expression data.\n\n3. **Fit the Model**: Next, you fit the linear model to your data (let's say your expression data is in a variable called `expression_data`):\n\n   ```r\n   library(limma)\n   fit <- lmFit(expression_data, design)\n   ```\n\n   Here, `lmFit` fits the linear model considering the design matrix created.\n\n4. **Apply eBayes**: After fitting the model, you apply the empirical Bayes smoothing to the standard errors:\n\n   ```r\n   fit <- eBayes(fit)\n   ```\n\n5. **Extract Results**: Finally, you can extract the results for a specific contrast or comparisons between the groups. For example:\n\n   ```r\n   results <- topTable(fit, coef = \"group_factor1_factor2_1_factor3_1\")\n   ```\n\nRemember to replace `\"group_factor1_factor2_1_factor3_1\"` with the correct name corresponding to the specific comparison you wish to investigate.\n\nThis setup allows you to assess how different combinations of factors influence the outcome, thus enabling a comprehensive factorial analysis with limma.\n\nThis approach is generally effective for identifying differentially expressed features in multi-factor experimental designs [X]. If you need further clarification or deeper insights on specific parts, feel free to ask!\n\nReferences:\n"
    // }
  ]);
  // console.log(messages)
  // 2.2 Clear Messages
  function clearChat() {
    setMessages([]);
  }
  // 3. For message is loading control message mismatch (Unused)
  const [isLoading, setIsLoading] = useState(false);

  // 3. Handles both pageToShow and update/add messages
  async function handleMessages(formdata) {
    // 3.1. I will access home page messge here from the form data
    const userInput = formdata.get("messageInput");
    console.log(userInput);

    // 3.2. Validate user data is not empty
    if (!userInput || userInput.trim().length === 0 || isLoading) return;

    // 3.3. Message is loading feature
    setIsLoading(true);
    // 3.3. If not change the page
    setPageToShow((prev) => true);

    // 3.4. User input goes in the user messgae
    // Create a unique ID for this specific turn
    const turnId = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${turnId}`,
        role: "user",
        content: userInput,
      },
    ]);

    // Performs API call
    // const response = await sendMessageToOpenAI(userInput);
    // Forcing to rerender
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Run the API
    try {
      const LIMMAGENIE_API_URL = import.meta.env.VITE_LIMMAGENIE_API_URL;
      // Wrapped userInput in encodeURIComponent() to safely handle symbols like '?', '&', or '+'
      const response_json = await fetch(`${LIMMAGENIE_API_URL}${encodeURIComponent(userInput)}`);

      // Sometimes API might not work: Added manual check for response.ok to catch 404 or 500 errors before parsing JSON
      console.log(response_json);
      if (!response_json.ok) throw new Error("API Error");

      const data = await response_json.json();
      const response = data.message;
      console.log("API Running");
      console.log(response);
      // const response = "All good response from AI works!"

      // 3. Add Agent Reply to the messages
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${turnId}`,
          role: "assistant",
          content: response,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${turnId}`,
          role: "assistant",
          content: "Couldn't connect to the server. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }
  console.log(messages);

  return (
    <div className="h-dvh w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col overflow-hidden">
      <Header clearChat={clearChat} />
      {pageToShow ? (
        <ChatPage messages={messages} handleMessages={handleMessages} isLoading={isLoading} />
      ) : (
        <HomePage handleMessages={handleMessages} />
      )}
    </div>
  );
}

export default App;
