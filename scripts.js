document.addEventListener("DOMContentLoaded", () => {
    //Sections
    const registrationSection = document.querySelector("#registrationSection");
    const loginSection = document.querySelector("#loginSection");
    const postBlogSection = document.querySelector("#postBlogSection");
    const contentSearchSection = document.querySelector("#contentSearchSection");
    const followSection = document.querySelector("#followSection");
    const unfollowSection = document.querySelector("#unfollowSection");
    const followedContentSection = document.querySelector("#followedContentSection");
    const searchSection = document.querySelector("#searchSection");
    //Message
    const followMessage = document.querySelector("#followMessage");
    const loginMessage = document.querySelector("#loginMessage");
    const unfollowMessage = document.querySelector("#unfollowMessage");
    const regMsg = document.querySelector("#registrationMessage");
    //Input
    const followUsernameInput = document.querySelector("#followUsername");
    const unfollowUsernameInput = document.querySelector("#unfollowUsername");
    //Buttons
    const searchBtn = document.querySelector("#searchBtn");
    const searchUserBtn = document.querySelector("#searchUserBtn");
    const registrationBtn = document.querySelector("#registrationBtn");
    const followBtnNav = document.querySelector("#followBtnNav");
    const unfollowBtnNav = document.querySelector("#unfollowBtnNav");
    const postBlogBtnNav = document.querySelector("#postBlogBtnNav");
    const loadContentBtn = document.querySelector("#loadContentBtn");
    //Other
    const contentDisplayArea = document.querySelector("#contentDisplayArea");
    const searchResults = document.querySelector("#searchResults");

    const hideAllSections = () => {
        registrationSection.style.display = "none";
        loginSection.style.display = "none";
        followSection.style.display = "none";
        unfollowSection.style.display = "none";
        followedContentSection.style.display = "none";
        postBlogSection.style.display = "none";
        searchSection.style.display = "none";
        contentSearchSection.style.display = "none";
    };

    registrationBtn.addEventListener("click", () => {
         //Show the registration form
        hideAllSections();
        registrationSection.style.display = "block";
        loadContentBtn.style.display = "none";
    });

    //show the login form when the "login " button is clicked
    const loginBtn = document.querySelector("#loginBtn");
    loginBtn.addEventListener("click", () => {
        hideAllSections();
        loginSection.style.display = "block";
        loadContentBtn.style.display = "none";

        // Clear registration message
        regMsg.textContent = "";
    });
    

    //Handle registration when the "Submit" button is clicked
    const submitRegistration = document.querySelector("#submitRegistration");
    submitRegistration.addEventListener("click", async () => {
        const username = document.querySelector("#username").value.trim();
        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value.trim();
        const dob = document.querySelector("#dob").value.trim();
        const gender = document.querySelector("#gender").value;
    
        //Validate input
        const usernameRegex = /^[A-Za-z]{3,}$/;
        if (!username || !usernameRegex.test(username)) {
            regMsg.textContent = "Username must be at least 3 letters.";
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
        regMsg.textContent = "Please enter a valid email address.";
        return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            regMsg.textContent = "Password must have at least 8 characters, including 1 uppercase, 1 lowercase, and 1 number.";
            return;
        }

        if (!dob) {
            regMsg.textContent = "Please enter your date of birth.";
            return;
        }
        const year = parseInt(dob.split("-")[0]);
        console.log("Extracted Year:", year);
        if (year < 1900 || year > 2025) {
            regMsg.textContent = "Year of birth must be between 1900 and 2025.";
            return;
        }

        if (!gender) {
            regMsg.textContent =  "Please select your gender.";
            return;
        }

        //Convert to JSON
        const userJSON = JSON.stringify({ 
            name: username,
            email: email,
            password: password,
            dob: dob,
            gender: gender,
        });

        //POST userJSON to the server
        try {
            const response = await fetch('/M00959112/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: userJSON,
            });

            //Output result
            const result = await response.json();
            if (result.registration === true) {
                loadContentBtn.style.display= "none";
                console.log("Registration successful:", result);
                regMsg.textContent = `Welcome, ${result.username}! Registration successful. `;
                regMsg.style.color = "green"; ////remove it for CSSSSSSSSSSSS  
                
                document.querySelector("#username").value = "";
                document.querySelector("#email").value = "";
                document.querySelector("#password").value = "";
                document.querySelector("#dob").value = "";
                document.querySelector("#gender").value = "";

            } else {
                console.log("Registration failedd:", result);
                regMsg.textContent = result.message || "Registration failed. Please try again.";
                regMsg.style.color = "red";
            }
        } catch (err) {
            console.error("Error during registration:", err);
            regMsg.textContent = "An error occured. Please try again later.";
            regMsg.style.color = "red";
        }
    });

    //Handle login submission
    const submitLogin = document.querySelector("#submitLogin");
    submitLogin.addEventListener("click", async () => {
        const username = document.querySelector("#loginUsername").value.trim();
        const password = document.querySelector("#loginPassword").value.trim();

        if (!username || !password) {
            loginMessage.textContent = "Please fill in all fields";
            loginMessage.style.color = "red";
            return;
        }

        const loginData = JSON.stringify({ name: username, password: password});

        try {
            const response = await fetch(`http://localhost:8080/M00959112/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: loginData,
            });

            const result = await response.json();
            if (response.ok && result.login) {
                loginMessage.textContent = "Login successful!";

                hideAllSections();
                registrationBtn.style.display = "none";
                loginBtn.style.display = "none";

                logoutBtn.style.display = "block";
                postBlogSection.style.display = "block";
                loadContentBtn.style.display = "inline-block";
                searchBtn.style.display="inline-block";
                followBtnNav.style.display = "inline-block";
                unfollowBtnNav.style.display = "inline-block";
                postBlogBtnNav.style.display = "inline-block";

                //displays a welcome message
                loginMessage.innerHTML = `Welcome, ${username}!`;
                document.querySelector("#loginUsername").value = "";
                document.querySelector("#loginPassword").value = "";
            } else {
                loginMessage.textContent = result.message || "Login failed.";
            }
        } catch (err) {
            console.error("Error during login:", err);
            loginMessage.textContent = "An error occurred. Please try again later.";
        }
    });

    const logoutBtn = document.querySelector("#logoutBtn");
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch('/M00959112/login', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
    
            if (response.ok) {
                // Reset the UI
                hideAllSections();
                searchBtn.style.display = "none";
                searchUserBtn.style.display = "none";
                followBtnNav.style.display = "none";
                unfollowBtnNav.style.display = "none";
                postBlogBtnNav.style.display = "none";
                loadContentBtn.style.display = "none";
                logoutBtn.style.display="none";

                loginSection.style.display = "block"; // Show login section
                loginBtn.style.display = "inline-block";    // Show login button
                registrationBtn.style.display = "inline-block"; // Show registration button
                // Clear follow message
                loginMessage.innerHTML = "";

            } else {
                console.error("Failed to log out");
                alert("Failed to log out. Please try again.");
            }
        } catch (err) {
            console.error("Error during logout:", err);
            alert("An error occurred during logout. Please try again later.");
        }
    });

    const followBtn = document.querySelector("#followBtn");
    followBtn.addEventListener("click", async () => {
        const usernameToFollow = followUsernameInput.value.trim();

        if (!usernameToFollow) {
            followMessage.textContent = "Pleaser enter a username to follow.";
            followMessage.style.color = "red";
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/M00959112/follow', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ usernameToFollow}),
            });

            const result = await response.json();

            // check if response was successful
            if (response.ok && result.success) {
                followMessage.textContent = result.message || "Followed successfully.";
                followMessage.style.color = "green";

                usernameToFollow.value = "";

            }  else {
                followMessage.textContent = result.error || result.message || "An error occured.";
                followMessage.style.color = "red";

                usernameToFollow.value = "";
            }
        } catch (error) {
            console.error("Error following user:", error);
            followMessage.textContent = "An error occurred while following the user.";
            followMessage.style.color = "red";
        }
    })

    // Show Follow section
    followBtnNav.addEventListener("click", () => {
        hideAllSections();
        followSection.style.display = "block";

        // Clear previous follow message
        followMessage.textContent = "";
        followUsernameInput.value = ""; 
    });

    const unfollowBtn = document.querySelector("#unfollowBtn");
    unfollowBtn.addEventListener("click", async () => {
        const usernameToUnfollow = unfollowUsernameInput.value.trim();

        // Validate input
        if (!usernameToUnfollow) {
            unfollowMessage.textContent = "Please enter a username to unfollow.";
            unfollowMessage.style.color = "red";
            return;
        }
        try {
            // Send DELETE request to unfollow the user
            const response = await fetch(`http://localhost:8080/M00959112/follow/${usernameToUnfollow}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            unfollowMessage.innerHTML="";
            // Handle response
            if (response.ok && result.success) {
                unfollowMessage.textContent = result.message || `Successfully unfollowed ${usernameToUnfollow}.`;
                unfollowMessage.style.color = "green";
            } else {
                unfollowMessage.textContent = result.error || result.message || "An error occurred.";
                unfollowMessage.style.color = "red";
            }
    
            // clear input field
            document.querySelector("#unfollowUsername").value = "";
    
        } catch (error) {
            console.error("Error unfollowing user:", error);
            unfollowMessage.textContent = "An error occurred while unfollowing the user.";
            unfollowMessage.style.color = "red";
        }
    });

    // Show Unfollow section
    unfollowBtnNav.addEventListener("click", () => {
        hideAllSections();
        unfollowSection.style.display = "block";

        unfollowMessage.textContent = "";
        unfollowUsernameInput.value = "";
    });
    
    
    loadContentBtn.addEventListener("click", async () => {
         // Hide everything else except content section
        hideAllSections();
        followedContentSection.style.display = "block";

        contentDisplayArea.innerHTML = ""; // Clear previous content
        try {
            const response = await fetch('/M00959112/contents', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensures session cookies are sent
            });
            const result = await response.json();
    
            if (response.ok && result.content) {
                if (result.content.length > 0) {
                    // loop through each content item and display it on the page
                    result.content.forEach((item) => {
                        const contentDiv = document.createElement("div");
                        contentDiv.classList.add("content-item");
                        contentDiv.innerHTML = `
                            <p><strong>${item.username}:</strong> ${item.text}</p>
                            ${
                                item.image
                                    ? `<img src="${item.image}" alt="Post image" style="max-width: 300px; max-height: 300px; display: block; margin-top: 10px;" />`
                                    : ""
                            }                            
                            <small>Posted on: ${new Date(item.createdAt).toLocaleString()}</small>
                        `;
                        contentDisplayArea.appendChild(contentDiv);
                    });
                } else {
                    //a message on screen if there is no content to show
                    contentDisplayArea.innerHTML = "<p>No content from followed users.</p>";
                }
            } else {
                contentDisplayArea.innerHTML = `<p style="color: red;">${result.error || "Error fetching content."}</p>`;
            }
        } catch (err) {
            console.error("Error fetching content:", err);
            contentDisplayArea.innerHTML = `<p style="color: red;">An error occurred while loading content.</p>`;
        }
    });
    
    searchUserBtn.addEventListener("click", async () => {
        const query = document.querySelector("#searchUserInput").value.trim();
        const searchUserMessage = document.querySelector("#searchUserMessage");
    
        // Clear previous message
        searchUserMessage.textContent = "";
        searchResults.innerHTML = "";
    
        if (!query) {
            searchUserMessage.textContent = "Please enter a search query.";
            searchUserMessage.style.color = "red";
            return;
        }
    
        try {
            const response = await fetch(`/M00959112/users/search?q=${encodeURIComponent(query)}`);
            const result = await response.json();
    
            if (response.ok && result.user && result.user.length > 0) {
                searchUserMessage.style.color = "green";
                searchUserMessage.textContent = `Found ${result.user.length} user(s): ${result.user.map(user => user.name).join(", ")}.`;

                // Display search results
                result.user.forEach(user => {
                    const userDiv = document.createElement("div");
                    userDiv.classList.add("user-result");
                    userDiv.textContent = user.name;
                    searchResults.appendChild(userDiv);
                });

            } else {
                searchUserMessage.style.color = "red";
                searchUserMessage.textContent = result.error || "No users found.";
            }
        } catch (err) {
            searchUserMessage.style.color = "red";
            searchUserMessage.textContent = "An error occurred while searching for users.";
            console.error("Error searching users:", err);
        }
    });

    const searchContentBtn = document.querySelector("#searchContentBtn");
    searchContentBtn.addEventListener("click", async () => {
        const query = document.querySelector("#searchContentInput").value.trim();
        const searchContentMessage = document.querySelector("#searchContentMessage");
        const contentSearchResults = document.querySelector("#contentSearchResults");

        // Clear previous messages and results
        searchContentMessage.textContent = "";
        contentSearchResults.innerHTML = "";

        if (!query) {
            searchContentMessage.textContent = "Please enter a search query.";
            searchContentMessage.style.color = "red";
            return;
        }

        try {
            // Send GET request to search for content
            const response = await fetch(`/M00959112/contents/search?q=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (response.ok && result.content && result.content.length > 0) {
                searchContentMessage.textContent = `Found ${result.content.length} result(s):`;
                searchContentMessage.style.color = "green";

                // Display search results
                result.content.forEach(content => {
                    const contentDiv = document.createElement("div");
                    contentDiv.classList.add("content-result");
                    contentDiv.innerHTML = `
                        <p><strong>${content.username}:</strong> ${content.text}</p>
                        <small>Posted on: ${new Date(content.createdAt).toLocaleString()}</small>
                    `;
                    contentSearchResults.appendChild(contentDiv);
                });
            } else {
                searchContentMessage.textContent = result.message || "No content found.";
                searchContentMessage.style.color = "red";
            }
        } catch (err) {
            console.error("Error searching for content:", err);
            searchContentMessage.textContent = "An error occurred while searching for content.";
            searchContentMessage.style.color = "red";
        }   
    });

    searchBtn.addEventListener("click", () => {
        // Hide all other sections
        hideAllSections();

        // Show search sections
        searchSection.style.display = "block";
        contentSearchSection.style.display = "block";

        // Clear any previous messages or input
        document.querySelector("#searchUserInput").value = "";
        document.querySelector("#searchContentInput").value = "";
        document.querySelector("#searchUserMessage").textContent = "";
        document.querySelector("#searchContentMessage").textContent = "";
        document.querySelector("#searchResults").innerHTML = "";
        document.querySelector("#contentSearchResults").innerHTML = "";
    });

    const postBlogBtn = document.querySelector("#postBlogBtn");
    postBlogBtn.addEventListener("click", async () => {
        const blogText = document.querySelector("#blogText").value.trim();
        const postBlogMessage = document.querySelector("#postBlogMessage");
        const blogImage = document.querySelector("#FileInput").files[0];
    
        
        postBlogMessage.textContent = "";

        if (!blogText) {
            postBlogMessage.textContent = "Blog content cannot be empty.";
            postBlogMessage.style.color = "red";
            return;
        }

        // Create a FormData object
        const formData = new FormData();
        formData.append("text", blogText);
        if (blogImage) {
            formData.append("image", blogImage);
        }

        try {
        // Send POST request with FormData
            const response = await fetch('/M00959112/contents', {
                method: 'POST',
                body: formData, 
                credentials: 'include', // Ensure cookies are sent for session authentication
            });

            const result = await response.json();
            if (response.ok && result.success) {
                postBlogMessage.textContent = "Blog posted successfully!";
                postBlogMessage.style.color = "green";

            // Clear the textarea and file input
                document.querySelector("#blogText").value = "";
                document.querySelector("#FileInput").value = "";
            } else {
                postBlogMessage.textContent = result.error || "Failed to post blog.";
                postBlogMessage.style.color = "red";
            }
        } catch (err) {
            console.error("Error posting blog:", err);
            postBlogMessage.textContent = "An error occurred while posting the blog.";
            postBlogMessage.style.color = "red";
        }
    });

    postBlogBtnNav.addEventListener("click", () => {
        hideAllSections();
        postBlogSection.style.display = "block";

        document.querySelector("#postBlogMessage").textContent = "";
        document.querySelector("#blogText").value = ""; // Clear blog text input
        document.querySelector("#FileInput").value = "";
    });
});

async function uploadFile() {
    const fileArray = document.getElementById("FileInput").files;
    const serverResponse = document.getElementById("ServerResponse");

    // Clear previous responses
    serverResponse.innerHTML = "";

    // Ensure a file is selected
    if (fileArray.length === 0) {
        serverResponse.innerHTML = "Please select a file to upload.";
        return;
    }

    // Create a FormData object and append the file
    const formData = new FormData();
    formData.append("myFile", fileArray[0]);

    try {
        // Send the file using fetch
        const response = await fetch('/M00959112/upload', {
            method: 'POST',
            body: formData,
        });

        // Handle server response
        const result = await response.json();
        if (response.ok) {
            serverResponse.innerHTML = "File uploaded successfully!";
        } else {
            serverResponse.innerHTML = result.error || "An error occurred.";
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        serverResponse.innerHTML = `Error uploading file: ${error.message}`;
    }
}

async function fetchRandomRecipes() {
    const randomRecipesDiv = document.getElementById('randomRecipes');
    randomRecipesDiv.innerHTML = "Loading random recipes...";

    try {
        const response = await fetch('/recipes/random');
        const recipes = await response.json();

        if (recipes && recipes.length > 0) {
            randomRecipesDiv.innerHTML = recipes.map(recipe => `
                <div class="recipe">
                    <h3>${recipe.title}</h3>
                    <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 300px;">
                    <p><a href="${recipe.sourceUrl}" target="_blank">View Recipe</a></p>
                </div>
            `).join('');
        } else {
            randomRecipesDiv.textContent = "No random recipes found.";
        }
    } catch (error) {
        console.error('Error fetching random recipes:', error);
        randomRecipesDiv.textContent = "Failed to fetch random recipes.";
    }
}
