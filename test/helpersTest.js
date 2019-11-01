const { assert } = require("chai");

const { getUserDataByEmail, emailFinder, findUserId, getUserById } = require("../helpers");

//For testing driver data
const testUsers = {
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

const testDatabase = {
  hjkyui: { longURL: "https://www.tsn.ca", userID: "b6UTxQ" },
  fafaff: { longURL: "https://www.google.ca", userID: "b6UTxQ" },
  wewewe: { longURL: "https://www.google.ca", userID: "b6UTxQ" },
  fdfdfd: { longURL: "https://www.google.ca", userID: "i3BoGr" },
  ertgfd: { longURL: "https://www.google.ca", userID: "i3BoGr" },
  qwsazx: { longURL: "https://www.google.ca", userID: "i3BoGr" },
  qwedsa: { longURL: "https://www.google.ca", userID: "i3BoGr" }
};

//1. Testing getUserDataByEmail function.
describe("getUserDataByEmail", function() {
  it("should return a user with that email", function() {
    const user = getUserDataByEmail(testUsers, "user2@example.com");
    const expectedOutput = {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    };
    assert.deepEqual(user, expectedOutput);
  });

  it("should return undefiened if user with email does not match", function() {
    const user = getUserDataByEmail(testUsers, "user3@example.com");
    assert.isUndefined(user);
  });
});

//2. Testing emailFinder function
describe("emailFinder", function() {
  it("should return true if user with said email found in database", function() {
    const output = emailFinder(testUsers, "user@example.com");
    assert.isTrue(output);
  });
  it("should return false if user with said email not found in database", function() {
    const output = emailFinder(testUsers, "user3@example.com");
    assert.isFalse(output);
  });
});

//3. Testing findUserId function
describe("findUserId", function() {
  it("should find a userID based on email", function() {
    const user = findUserId(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});

//4. Testing getUserById function
describe("getUserById", function() {
  it("should filter the user data of URLs based on the ID provided", function() {
    const output = getUserById(testDatabase, "i3BoGr");
    const expectedOutput = {
      fdfdfd: { longURL: "https://www.google.ca", userID: "i3BoGr" },
      ertgfd: { longURL: "https://www.google.ca", userID: "i3BoGr" },
      qwsazx: { longURL: "https://www.google.ca", userID: "i3BoGr" },
      qwedsa: { longURL: "https://www.google.ca", userID: "i3BoGr" }
    };
    assert.deepEqual(output, expectedOutput);
  });
});
