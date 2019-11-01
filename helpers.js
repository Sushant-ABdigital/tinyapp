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

//2 Generate the data for user by Email
const getUserDataByEmail = (source, userEmail) => {
  let result;
  for (const data in source) {
    if (source[data].email === userEmail) {
      result = source[data];
    }
  }
  return result;
};

//3.Function to check if we have email in users object.
const emailFinder = (source, email) => {
  for (const userId in source) {
    if (source[userId].email === email) {
      return true;
    }
  }
  return false;
};

//4 Function to get the user
const findUserId = (source, email) => {
  for (const userId in source) {
    if (source[userId].email === email) {
      return source[userId].id;
    }
  }
};

//5 Generate the data for user
const getUserById = (source, user) => {
  let result = {};
  for (const data in source) {
    if (source[data].userID === user) {
      result[data] = source[data];
    }
  }
  return result;
};

//6. Function to check if user owns the URL
const ownershipCheck = (urlDatabase, userId, link) => {
  for (let data in urlDatabase) {
    if (urlDatabase[data]["userID"] === userId) {
      if (data === link) {
        return true;
      }
    }
  }
  return false;
};

module.exports = { generateRandomString, getUserDataByEmail, emailFinder, findUserId, getUserById, ownershipCheck };
