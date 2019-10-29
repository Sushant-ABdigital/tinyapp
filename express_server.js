const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

const urlDatabase = {
  b2xVn2: "www.lighthouselabs.ca",
  "9sm5xK": "www.google.com"
};

//Function to generate random string
const generateRandomString = () => {
  let result = "";
  const source = "abcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    result += source.charAt(Math.floor(Math.random() * source.length));
  }
  return result;
};

//** using the body parser so that the data sending from browser will be made human readable as they are
// being encoded from buffer to human readable code
app.use(bodyParser.urlencoded({ extended: true }));

//****** Setting the view engine as ejs
app.set("view engine", "ejs");

//****** Routes
app.get("/", (req, res) => {
  res.send("hello");
});

//Rendering the database into url_index file in views.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  //render mehthod takes in file name and data that we want to send!
  res.render("urls_index.ejs", templateVars);
});

//Rendering the new URLS
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Creation of new URL
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  // res.redirect(`/urls/${randomString}`);
  res.redirect(`/urls/`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//Sending user to external URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`https://${longURL}`);
});

//*** Delete Functionality
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//*** Edit functionality
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(req.body.updatedURL);
  urlDatabase[shortURL] = req.body.updatedURL;
  res.redirect("/urls");
});
//Server to listen on ...
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
