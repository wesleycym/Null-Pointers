import socket from "./clientWebsocket.js";

document.getElementById("send-dm-btn").addEventListener("click", (e) => 
    {
        e.preventDefault(); // Prevent the default behavior

        const recipient = document.getElementById("dm-recipient").value; // Get the recipient
        const message = document.getElementById("dm-message").value; // Get the message

        if (!recipient || !message) // Check if the recipient and message are empty
            {
                alert("Please enter a recipient and message"); // Alert the user
                return; // Exit
            }

        console.log(`Recipient: ${recipient}, Message: ${message}`);

        sendMessage(recipient, message); // Call helper function
    });

function sendMessage(recipient, message)
{
    console.log(`Sending message to ${recipient}: ${message}`);
    
    if (socket && socket.readyState === WebSocket.OPEN) // Check if the socket is open
    {
        socket.send(JSON.stringify({ // Send the message
            type: "direct_message", // Send the type
            recipient: recipient, // Send the recipient
            message: message, // Send the message
        }));

        console.log(`Message sent to ${recipient}: ${message}`);

        document.getElementById("dm-recipient").value = ""; // Clear the recipient
        document.getElementById("dm-message").value = ""; // Clear the message

    } else
    {
        console.log("Socket is not open");
        alert("Failed to send message"); // Alert the user
    }
}