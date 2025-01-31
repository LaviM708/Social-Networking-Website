import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import {MongoClient, ServerApiVersion} from 'mongodb';
import fileupload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; 

const connectionURI = "mongodb://127.0.0.1:27017?retryWrites=true&w=majority";

//Set up client
const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false, //setting this to true breaks text index queries.
        deprecationErrors: true,
    }
});

//Connect to the Database
await client.connect();
const db = client.db('recipeSharingDB');
const usersCollection = db.collection('users');

//File upload
const app = express();
app.use(fileupload());
app.use(bodyParser.json())
app.use(express.static('public'));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//configure express to use express-session
app.use(
    expressSession({
        secret: 'M00959112',
        cookie: {maxAge: 30 * 60 * 1000},
        resave: false,
        saveUninitialized: true
    })
);

//Set up application to handle GET requests
app.get('/M00959112/login', checklogin); //Check to see if user is logged in
app.get('/M00959112/contents', followedContent);//content from followed users
app.get('/M00959112/users/search',searchUsers); //search a particular user
app.get('/M00959112/contents/search',searchContent); //search contents

//Set up application to handle DELETE requests
app.delete('/M00959112/login', logout); //Logs user out
app.delete('/M00959112/follow/:username?', unfollowUser); // Unfollows a user

//Set up application to handle POST requests
app.post('/M00959112/login', login); //Logs the user in
app.post('/M00959112/users', register); //Register a new user
app.post('/M00959112/contents', postContent); //Uploading content
app.post('/M00959112/follow', followUser); //Follow a user

//Start the app listening on port 8080
app.listen(8080);
console.log("listening on 8080");

//app.get/checklogin -> Checks to see if the user has logged in 
async function checklogin(req, res) {
    if (!req.session.username) {
        return res.send({ login: false });
    }
    const user = await usersCollection.findOne({ name: req.session.username });
    if (user) {
        res.send({ login: true, username: req.session.username });
    } else {
        res.send({ login: false });
    }
}

//app.delete/logout -> Logs the user out
async function logout(req,res){
    //Destroy session.
    req.session.destroy(err => {
        if(err){
            console.error("Error destroying session:", err)
            res.send({error: err});
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ logout: true, message: "Successfully logged out." });
    });
}

//app.post/login ->Logs user IN
async function login(req,res){
    const userlogin = req.body;
    console.log("Name: "+ userlogin.name + " Password: " + userlogin.password); /////IS IT OK TO PRINT IT ON THE CONSOLE OR SHOUDL I REMOVE IT

    //find user in the database
    const user = await usersCollection.findOne({ name: userlogin.name, password: userlogin.password});

    if (user){
        req.session.username = user.name;
        res.send({login:true});
    } else {
        res.send({login: false, message: "username or password is incorrect."});
    }
}

//app.post/register -> registers a new user.
async function register(req,res){
    try {
        const { name, email, password, dob, gender } = req.body;

        //validate inputs
        if (!/^[A-Za-z]{3,}$/.test(name)) {
            return res.status(400).json({ registration: false, message: "Invalid username. Must be at least 3 letters." }); ////ALSO CAN I PUT THOSE ERROR STATUS CODE ??????????
        }
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            return res.status(400).json({ registration: false, message: "Invalid email address." });
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            return res.status(400).json({ registration: false, message: "Invalid password. Must include uppercase, lowercase, and a number." });
        }
        if (!dob) {
            return res.status(400).json({ registration: false, message: "Date of birth is required." });
        }
        if (!["male", "female", "other"].includes(gender)) {
            return res.status(400).json({ registration: false, message: "Invalid gender." });
        }

        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ name });
        if (existingUser) {
            return res.status(400).json({ registration: false, message: "Username already exists." });
        }

        const existingEmail = await usersCollection.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ registration: false, message: "Email already exists." });
        }

        // Insert the new user into MongoDB
        const result = await usersCollection.insertOne({ 
            name,
            email,
            password,
            dob,
            gender,
            following: [], });

        res.status(201).json({ registration: true, username: name, message: "Registration successful." });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ registration: false, message: "Internal server error." });
    }
}

// app.post/contents -> User uploading content with an optional image
async function postContent(req, res) {
    const loggedInUser = req.session.username;
    const { text } = req.body;

    if (!loggedInUser) {
        return res.send({ error: "You must be logged in to post content." });
    }

    if (!text || text.trim() === "") {
        return res.send({ error: "Please write something to post. It cannot be empty." });
    }

    let imagePath = null;

    // Check if an image was uploaded
    if (req.files && req.files.image) {
        const image = req.files.image;
        const filename = `${Date.now()}-${image.name}`;
        const filepath = `./uploads/${filename}`;
        imagePath = `/uploads/${filename}`; // Public path for the image

        try {
            // Save the file to the uploads directory
            await image.mv(filepath);
        } catch (err) {
            console.error("Error saving image:", err);
            return res.status(500).send({ error: "Failed to upload the image." });
        }
    }

    // Insert the blog content with the optional image into the 'contents' collection
    await db.collection('contents').insertOne({
        username: loggedInUser,
        text: text,
        image: imagePath, // Save image path (null if no image)
        createdAt: new Date(),
    });

    res.send({ success: true, message: "Content posted successfully." });
}

//app.get/contents -> get contents from followed users
async function followedContent(req, res) {
    const loggedInUser = req.session.username;

    if(!loggedInUser) {
        return res.send({ error: "You must be logged in to view content."});
    }

    const user = await usersCollection.findOne({name: loggedInUser});
    if(!user || !user.following || user.following.length === 0 ){
        return res.send({error: "You are not following any users."});
    }

    //Content uploaded by users who logged-in user is following
    const content = await db.collection('contents').find({username: { $in: user.following } }).toArray();

    res.send({content});
}

//app.post/contents -> follow a user
async function followUser(req, res) {
    const loggedInUser = req.session.username;

    if (!loggedInUser) {
        return res.send({ error: "You must be logged in to follow someone."});
    }

    const usernameToFollow = req.params.username?.trim() || req.body.usernameToFollow?.trim(); //The username to follow

    if (!usernameToFollow) {
        return res.send({ error: "No username provided to follow."});
    }

    if (loggedInUser === usernameToFollow) {
        return res.send({ error: " You cannot follow yourself."});
    }

    //Check if the user to follow exists. I AM DOING IT FOR POSTMAN CHECK IF IT MAKE SENSE WHEN WORKING WITH FRONTEND
    const userToFollow = await usersCollection.findOne({ name: usernameToFollow});
    if (!userToFollow) {
        return res.send({ error: "The user you are trying to follow does not exist."});
    }

    const user = await usersCollection.findOne({ name: loggedInUser});
    if (!user){
        return res.send({ error: "User not found."});
    }

    //Check if the user is already following the person
    if (user.following && user.following.includes(usernameToFollow)) {
        return res.send({ error: "You are already following this user."});
    }

    //Add the user to the 'following' list
    await usersCollection.updateOne(
        { name: loggedInUser},
        {$push: { following: usernameToFollow } }
    );

    res.send({ success: true, message: `You are now following ${usernameToFollow}`});
}

//app.delete/follow -> Unfollow a user 
async function unfollowUser(req, res) {
    const loggedInUser = req.session.username;

    if (!loggedInUser) {
        return res.send({ error: "You must to logged in to unfollow someone."});
    }

    //get the username to unfollow from URL or body 
    const usernameToUnfollow  = req.params.username?.trim() || req.body.usernameToUnfollow?.trim(); 

    if (!usernameToUnfollow) {
        return res.send({ error: "No username provided to unfollow"});
    }

    const user = await usersCollection.findOne({ name: loggedInUser});
    if (!user) {
        return res.send({ error: "logged-in User not found."});
    }

    //Check if the user is actually following the person
    if (user.following && !user.following.includes(usernameToUnfollow)) {
        return res.send({ error: "You are not following this user."});
    }

    //Remove the user from the 'following' list
    await usersCollection.updateOne(
        {name: loggedInUser},
        {$pull: {following: usernameToUnfollow}}
    );

    res.send({ success: true, message: `You have unfollowed ${usernameToUnfollow}`});
}

//app.get/users/search -> search for users by query
async function searchUsers(req, res) {
    const query = req.query.q.trim();

    if (!query || query === "") {
        return res.send({ error: "No search query provided"});
    }
    console.log("Search query:", query);
    try {
        //search for users whose names match the query (case-insensitive) ///////DOUBLE CHECKKKKK
        const user = await usersCollection
            .find({ name: { $regex: query, $options: 'i' } })
            .project({ password: 0, following: 0 }) //Exclude sensitive fields
            .toArray();

        console.log("Users found:", user);
        if (user.length === 0 ){
            return res.send({ message: "No users found matching your query."});
        }
        
        res.send({user});
    } catch (err) {
        console.error("Error searching users:", err);
        res.send({error: "An error occured while searching for user."});
    }
}

//app.get/content/search -> search content based on query
async function searchContent(req, res) {
    const query = req.query.q?.trim();

    if (!query || query === "") {
        return res.send({ error: "No search query provided"});
    }

    console.log("Search query:", query);

    try {
        // Search for content that matches the query in the 'text' field (case-insensitive)
        const content = await db.collection('contents')
            .find({ text: { $regex: query, $options: 'i'} })
            .toArray();
        console.log("Content found:", content);

        if (content.length === 0){
            return res.send({ message: "No content found matching your query."});
        }

        res.send({ content })
    } catch (err) {
        console.error("Error searching content: ", err);
        res.send({ error: "An error occured while searching for content."});
    }
}

app.post('/upload', (req, res) => {
    // Check if a file is uploaded
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.image; // Retrieve the uploaded file
    const filename = `${Date.now()}-${file.name}`; // Unique filename
    const filepath = path.join(__dirname, 'uploads', filename); // Full path to save the file

    // Move the file to the uploads folder
    file.mv(filepath, (err) => {
        if (err) {
            console.error("Error saving file:", err);
            return res.status(500).json({ error: 'Error saving file' });
        }

        res.status(201).json({
            message: 'File uploaded successfully!',
            fileUrl: `/uploads/${filename}` // URL to access the file
        });
    });
});

const SPOONACULAR_API_KEY= '83ea189516a8422e8a0176b63f455c08'; 
// random recipes
app.get('/recipes/random', async (req, res) => {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/random?number=5&apiKey=${SPOONACULAR_API_KEY}`);
        const data = await response.json();
        res.json(data.recipes); // Send recipes to the client
    } catch (error) {
        console.error('Error fetching random recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes.' });
    }
});


