import axios from "axios";
import express from "express";

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let correctAnswer;
let currentDog;
let currentImage;
let score = 0;
let guesses = 0;

app.get("/", async (req, res) => {
  // console.log("================= GET ======================");
  const [
    page1,
    page2,
    page3,
    page4,
    page5,
    page6,
    page7,
    page8,
    page9,
    page10,
  ] = await Promise.all([
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=1"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=2"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=3"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=4"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=5"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=6"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=7"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=8"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=9"),
    axios.get("https://dogapi.dog/api/v2/breeds?page[number]=10"),
  ]);

  const breeds = [
    ...page1.data.data,
    ...page2.data.data,
    ...page3.data.data,
    ...page4.data.data,
    ...page5.data.data,
    ...page6.data.data,
    ...page7.data.data,
    ...page8.data.data,
    ...page9.data.data,
    ...page10.data.data,
  ];

  const ids = breeds.map((breed) => breed.id);
  const randomIndex = Math.floor(Math.random() * ids.length);
  const randomId = ids[randomIndex];

  // console.log("get", `https://dogapi.dog/api/v2/breeds/${randomId}`);

  const response = await axios.get(
    `https://dogapi.dog/api/v2/breeds/${randomId}`,
  );

  const dog = response.data.data;
  correctAnswer = dog.id;
  currentDog = dog;

  const images = dog.attributes.images;
  let image = "";
  if (images?.length > 0) {
    const randomIndex = Math.floor(Math.random() * images.length);
    image = images[randomIndex].url;
  }
  currentImage = image;

  const choices = [dog];
  while (choices.length < 4) {
    const randomChoice = breeds[Math.floor(Math.random() * breeds.length)];

    if (!choices.includes(randomChoice)) {
      choices.push(randomChoice);
    }
  }
  choices.sort(() => Math.random() - 0.5);

  // console.log("dog", dog);
  // console.log("result", null);
  // console.log("choices", choices);

  res.render("index.ejs", {
    dog,
    image,
    choices,
    result: null,
    score,
    guesses,
  });
});

app.post("/guess", async (req, res) => {
  // console.log("==============POST==============");
  const guess = req.body.guess;
  const dogId = req.body.dogId;

  let result;
  guesses++;

  if (guess === dogId) {
    result = "Correct!";
    score++;
  } else {
    result = "Incorrect!";
  }
  // console.log("URL", `https://dogapi.dog/api/v2/breeds/${dogId}`);
  const response = await axios.get(`https://dogapi.dog/api/v2/breeds/${dogId}`);

  const dog = response.data.data;

  res.render("index.ejs", {
    dog,
    image: currentImage,
    choices: [],
    result,
    score,
    guesses,
  });
});

// Start the server
app.listen(port, () => {
  // console.log(`Server running at http://localhost:${port}`);
});
