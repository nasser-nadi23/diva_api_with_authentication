const express = require("express");
const got = require("got");
const auth = require("../middleware/auth");

const router = new express.Router();

// Get all categories and store it on an array.
let allCategories = [];

async function getAllCategories() {
  if (!allCategories.length > 0) {
    allCategories = [];
    const fetchedCategory = await got.get(
      "https://api.divar.ir/v8/web-search/mashhad/"
    );
    const parsedData = JSON.parse(fetchedCategory.rawBody);
    const categoriesObject =
      parsedData.schema.ui_schema.category.urischema.display;
    const categoriesArray = Object.values(categoriesObject);
    allCategories.push(categoriesArray);
    return allCategories.flat(2);
  } else {
    return allCategories.flat(2);
  }
}

// Get all advertisings
let allAdvertising;

async function getData(searchKeyword) {
  await getAllCategories();
  if (allCategories.flat(2).includes(searchKeyword)) {
    allAdvertising = [];
    const data = await got.get(
      `https://api.divar.ir/v8/web-search/mashhad/${searchKeyword}`
    );
    const parsedData = JSON.parse(data.rawBody);
    const array = parsedData.widget_list;
    array.map((el) => {
      const newAdvertise = {
        id: Math.floor(Math.random() * 1000),
        text: el.data.title,
        image: el.data.image,
        price: el.data.description,
        city: el.data.city,
      };
      allAdvertising.push(newAdvertise);
    });
  } else {
    console.log("not found");
  }
}

// getData()

// setInterval(() => {
//     getData()
// }, 300000)

///////////////////// Endpoints /////////////////////////////////////////////////////////////////////////////////////////////
// Get query string
router.get("/nasser", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  await getData(req.query.search);
  if (!allCategories.flat(2).includes(req.query.search)) {
    return res.status(404).send({ message: "Category not found" });
  }
  res.send(allAdvertising);
});
// Get all advertising
router.get("/advertising", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(allAdvertising);
});

// Get a specific advertise by given id
router.get("/advertising/:id", (req, res) => {
  const advertiseId = +req.params.id;
  const advertise = allAdvertising.find((item) => item.id === advertiseId);
  if (!advertise) {
    return res.status(404).send({ message: "advertise not found" });
  }
  res.status(200).send(advertise);
});

// Get all categories
router.get("/allCategories", async (req, res) => {
  await getAllCategories();
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send(allCategories.flat(2));
});

// Update duration -> Get all advertising after specific time
router.put("/update-advertising", (req, res) => {
  setInterval(async () => {
    await getData(req.body.category);
  }, +req.body.duration * 1000 * 60);
});

// Add a new category
router.post("/add-category", auth, async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (!req.body.category || req.body.category === "") {
    return res.status(400).send({ message: "Bad Request" });
  }
  const category = req.body.category;
  if (!category) {
    return res.status(400).send({ message: "Your data is invaild." });
  }
  allCategories.push(category);
  res.send(allCategories.flat(2));
});

// Remove a category by name
router.delete("/delete-a-category", auth, (req, res) => {
  if (!req.query.category || req.query.category === "") {
    return res.status(400).send({ message: "Bad Request" });
  }
  const category = req.query.category;
  const newArray = allCategories.flat(2);
  const index = newArray.indexOf(category);
  // If category not exit
  if (index === -1) {
    return res.status(404).send({ message: "category not found" });
  }
  newArray.splice(index, 1);
  allCategories = newArray;
  res.send(newArray);
});

module.exports = router;
