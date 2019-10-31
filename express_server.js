const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//Database - url
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "b6UTxQ" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "i3BoGr" }
};

//Database - Users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//***** HELPER FUNCTIONS  *****//
//1. Function to generate random string
const generateRandomString = () => {
  let result = "";
  const source = "abcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    result += source.charAt(Math.floor(Math.random() * source.length));
  }
  return result;
};

//2.Function to check if we have email in users object.
const emailFinder = (source, email) => {
  for (const userId in source) {
    if (source[userId].email === email) {
      return true;
    }
  }
  return false;
};

//3 Function to check the password
const passwordChecker = (source, password) => {
  for (const userId in source) {
    if (source[userId].password === password) {
      return true;
    }
  }
  return false;
};

//4 Function to get the user
const findUserString = (source, email) => {
  for (const userId in source) {
    if (source[userId].email === email) {
      return source[userId].id;
    }
  }
};

//5 Generate the data for user
const userData = (source, user) => {
  let result = {};
  for (const data in source) {
    if (source[data].userID === user) {
      result[data] = source[data];
    }
  }
  // console.log("DATABASE", urlDatabase);
  // console.log("RESULT", result);
  return result;
};
//** using the body parser so that the data sending from browser will be made human readable as they are
// being encoded from buffer to human readable code
app.use(bodyParser.urlencoded({ extended: true }));

//Using the cookie parser...
app.use(cookieParser());

//****** Setting the view engine as ejs
app.set("view engine", "ejs");

//****** Routes
app.get("/", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };

  res.render("front", templateVars);
});

//Rendering the database into url_index file in views.
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
    // urls: urlDatabase
  };
  //If there is no user logged in or registered.
  if (!req.cookies["user_id"]) {
    res.render("front", templateVars);
  } else {
    //Filtered data with the help of helper function
    let templateVars = {
      user: users[req.cookies["user_id"]],
      urls: userData(urlDatabase, [req.cookies["user_id"]].toString())
    };
    // console.log(templateVars);
    res.render("urls_index.ejs", templateVars);
  }
});

//Rendering the new URLS
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  //If user is not logged in just send the login page
  if (!req.cookies["user_id"]) {
    res.render("login", templateVars);
  } else {
    //Send the url new page since user is logged in.
    res.render("urls_new", templateVars);
  }
});

//Creation of new URL
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls/`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

//Sending user to external URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`https://${longURL}`);
});

//*** Delete Functionality
app.post("/urls/:shortURL/delete", (req, res) => {
  //check if user is logged in
  if (req.cookies["user_id"]) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("User should be logged in");
  }
});

//*** Edit functionality
app.post("/urls/:shortURL/edit", (req, res) => {
  // console.log(req.body.updatedURL);
  if (req.cookies["user_id"]) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect("/urls");
  } else {
    res.send("User should be loggedIn");
  }
});

//Handling the logout post route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Registration page
//Handling get request
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("registration", templateVars);
});

//Handling post request for registration page
app.post("/register", (req, res) => {
  //Check = Handling the errors if any
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Username and password should not be empty");
  } else if (emailFinder(users, req.body.email)) {
    res.status(400).send("Already registered user");
  } else {
    let randomString = generateRandomString();
    users[randomString] = {
      id: randomString,
      email: req.body.email,
      password: req.body.password
    };
    //Setting a cookie of random string
    res.cookie("user_id", randomString);
    res.redirect("/urls");
  }
});

//Serving the login page - GET
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

//Handling the login route - POST and setting the cookie.
app.post("/login", (req, res) => {
  if (!emailFinder(users, req.body.email)) {
    //User with email NOT found;
    res.status(403).send("Email does not match");
  } else {
    if (!passwordChecker(users, req.body.password)) {
      //password NOT matched
      res.status(403).send("password did not match");
    } else {
      const userCookie = findUserString(users, req.body.email);
      res.cookie("user_id", userCookie);
      res.redirect("/urls");
    }
  }
});

//Server to listen on ...
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
