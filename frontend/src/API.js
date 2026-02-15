const API_KEY = import.meta.env.LIMMAGENIE_OPENAI_API_KEY;

export async function sendMessageToOpenAI(message) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user", // This is the role of the person sending the message
                        content: message,
                    },
                ],
                max_tokens: 150,
            }),
        });

        const data = await response.json();
        // console.log("API Response:", data); // Log the full response for debugging

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim(); // Extract the response from the API
        } else {
            throw new Error("No response from API or invalid response structure");
        }
    } catch (error) {
        console.error("Error fetching AI response:", error);
        // throw error;
        return "Oops! Something went wrong.";
    }
};
