// Function is intended to open and close the DM popup

document.addEventListener("DOMContentLoaded", () => { // Add an event listener to the document
    const messagesLink = document.getElementById("messages-link"); // Get the messages link
    const dmPopup = document.getElementById("dm-popup"); // Get the DM popup
    const closePopupBtn = document.getElementById("close-dm-popup"); // Get the close button
    const userLink  = document.getElementById("user-data"); // Get the messages link
    const userPopup = document.getElementById("user-popup"); // Get the DM popup
    const closePopupBtnUser = document.getElementById("close-user-popup"); // Get the

    if(dmPopup) // Checking if it exists on startup
    {
        dmPopup.classList.add("hidden"); // Hide this shit
    }

    console.log("Running DM script");

    if (!messagesLink || !dmPopup || !closePopupBtn) // Debug
        {
            console.log("Missing elements");
            return; // Exit
        }

    messagesLink.addEventListener("click", (e) => // Add an event listener to the messages link
    {
        e.preventDefault(); // Prevent the default behavior

        if (dmPopup.classList.contains("hidden")) // Check if the DM popup is hidden
        {
            console.log("Opening DM popup");
            dmPopup.classList.remove("hidden"); // Remove the hidden class
        } 
        else // If the DM popup is not hidden
        {
            console.log("Closing DM popup");
            dmPopup.classList.add("hidden"); // Add the hidden class
        }
    });

    closePopupBtn.addEventListener("click", () => // Add an event listener to the close button
    {
        console.log("Close button clicked");
        dmPopup.classList.add("hidden"); // Add the hidden class
    });

    window.addEventListener("click", (e) => // Add an event listener to the window
    {
        console.log("Window clicked");

        if (!dmPopup.contains(e.target) && !messagesLink.contains(e.target)) // Check if the target is not the DM popup or the messages link
        {
            console.log("Click outside popup, hiding DM popup");
            dmPopup.classList.add("hidden"); // Add the hidden class
        }
    });



    if(userPopup) // Checking if it exists on startup
    {
        userPopup.classList.add("hidden"); // Hide this shit
    }

    console.log("Running DM script");

    if (!userLink || !userPopup || !closePopupBtnUser) // Debug
        {
            console.log("Missing elements");
            return; // Exit
        }

    userLink.addEventListener("click", (e) => // Add an event listener to the messages link
    {
        e.preventDefault(); // Prevent the default behavior

        if (userPopup.classList.contains("hidden")) // Check if the DM popup is hidden
        {
            console.log("Opening DM popup");
            userPopup.classList.remove("hidden"); // Remove the hidden class
        } 
        else // If the DM popup is not hidden
        {
            console.log("Closing DM popup");
            userPopup.classList.add("hidden"); // Add the hidden class
        }
    });

    closePopupBtnUser.addEventListener("click", () => // Add an event listener to the close button
    {
        console.log("Close button clicked");
        userPopup.classList.add("hidden"); // Add the hidden class
    });

    window.addEventListener("click", (e) => // Add an event listener to the window
    {
        console.log("Window clicked");

        if (!userPopup.contains(e.target) && !userLink.contains(e.target)) // Check if the target is not the DM popup or the messages link
        {
            console.log("Click outside popup, hiding DM popup");
            userPopup.classList.add("hidden"); // Add the hidden class
        }
    });
  
});