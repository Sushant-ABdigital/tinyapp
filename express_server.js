const express = require("express");
const app = express();
const PORT = 8080;

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//****** Setting the view engine as ejs
app.set("view engine", "ejs");


//****** Routes
app.get("/", (req, res) => {
  res.send("hello");
});

//Rendering the database into url_index file in views.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  //render mehthod takes in file name and
  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
