/* eslint-disable no-prototype-builtins */
/* eslint-disable camelcase */
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const {
  generateRandomString,
  emailFinder,
  findUserId,
  getUserById,
  getUserDataByEmail,
  ownershipCheck
} = require("./helpers");

//Database - url
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "b6UTxQ" },
  o3Bhgr: { longURL: "https://www.google.ca", userID: "i3BoGr" }
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

//** using the body parser so that the data sending from browser will be made human readable as they are
// being encoded from buffer to human readable code
app.use(bodyParser.urlencoded({ extended: true }));

//Using the cookie parser...
app.use(cookieParser());

//Using cookie-session
app.use(
  cookieSession({
    name: "user_id2",
    keys: ["Unbreakable"]
    // secret: 'secret string'
  })
);

//****** Setting the view engine as ejs
app.set("view engine", "ejs");

//****** Routes
app.get("/", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id2],
    urls: urlDatabase
  };

  res.render("front", templateVars);
});

//Rendering the database into url_index file in views.
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id2]
    // urls: urlDatabase
  };
  //If there is no user logged in or registered.
  if (!req.session.user_id2) {
    res.render("front", templateVars);
  } else {
    //Filtered data with the help of helper function
    let templateVars = {
      user: users[req.session.user_id2],
      urls: getUserById(urlDatabase, [req.session.user_id2].toString())
    };
    res.render("urls_index.ejs", templateVars);
  }
});

//Rendering the new URLS
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id2]
  };
  //If user is not logged in just send the login page
  if (!req.session.user_id2) {
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
    userID: req.session.user_id2
  };
  res.redirect(`/urls/`);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    //checking if anyone is logged in
    if (req.session.user_id2) {
      //tempvar with owbership
      let templateVars = {
        user: users[req.session.user_id2],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        ownershipCheck: ownershipCheck(urlDatabase, users[req.session.user_id2]["id"], req.params.shortURL.toString())
      };
      res.render("urls_show", templateVars);
    } else {
      //tempvars without ownership logic
      let templateVars = {
        user: users[req.session.user_id2],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        ownershipCheck: false
      };
      res.render("urls_show", templateVars);
    }
  } else {
    //Improvement: Can send 404 page.
    res.render("notFound");
  }
});

//Sending user to external URL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(`https://${longURL}`);
  } else {
    res.render("notFound");
  }
});

//*** Delete Functionality
app.post("/urls/:shortURL/delete", (req, res) => {
  //check if user is logged in and owns the URL
  if (req.session.user_id2 && ownershipCheck(urlDatabase, req.session.user_id2, req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.render("shouldLogin");
  }
});

//*** Edit functionality
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user_id2) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect("/urls");
  } else {
    res.render("shouldLogin");
  }
});

//Handling the logout post route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Registration page
//Handling get request
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id2]
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
      password: bcrypt.hashSync(req.body.password, 10)
    };
    //Setting session cookie
    req.session.user_id2 = randomString;
    res.redirect("/urls");
  }
});

//Serving the login page - GET
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id2] };
  res.render("login", templateVars);
});

//Handling the login route - POST and setting the cookie.

app.post("/login", (req, res) => {
  const user = getUserDataByEmail(users, req.body.email);
  if (user === undefined) {
    res.status(403).send("Email does not match");
  } else {
    //check for password
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      // password NOT matched
      res.status(403).send("password did not match");
    } else {
      const userCookie = findUserId(users, req.body.email);
      req.session.user_id2 = userCookie;
      res.redirect("/urls");
    }
  }
});

app.get("*", (req, res) => {
  res.render("front");
});

//Server to listen on ...
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
