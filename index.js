require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://bossUser:pHocpf4vTW2Dg3Cr@cluster0.ylidorg.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    const db = client.db("simple-book-catalog");
    const bookCollection = db.collection("book");

    // app.get("/books", async (req, res) => {
    //   // const cursor = bookCollection.find({});
    //   // const book = await cursor.toArray();

    //   // res.send({ status: true, data: book });

    //   const { searchTerm, genre, publicationDate } = req.query;

    //   console.log("searchTerm", searchTerm, genre, publicationDate);
    //   let filter = {};

    //   // Add filters based on query parameters
    //   if (searchTerm) {
    //     filter.$or = [
    //       { title: { $regex: new RegExp(searchTerm, "i") } },
    //       { author: { $regex: new RegExp(searchTerm, "i") } },
    //       { genre: { $regex: new RegExp(searchTerm, "i") } },
    //     ];
    //   }

    //   if (genre) {
    //     filter.genre = genre;
    //   }

    //   if (publicationDate) {
    //     filter.publicationDate = publicationDate;
    //   }

    //   const cursor = bookCollection.find(filter);
    //   const books = await cursor.toArray();
    //   console.log(books);

    //   res.send({ status: true, data: books });
    // });

    app.get("/books", async (req, res) => {
      const { searchTerm, genre, publicationDate } = req.query;

      console.log("searchTerm", searchTerm, genre, publicationDate);
      let filter = {};

      // if (typeof searchTerm === "string") {
      //   console.log("searchterm is steirng");
      // }
      // if (typeof searchTerm === "undefined") {
      //   console.log("searchterm is undefined");
      // }
      // Add filters based on query parameters
      if (searchTerm !== "null") {
        console.log("in searchTerm");
        filter.$or = [
          { title: { $regex: new RegExp(searchTerm, "i") } },
          { author: { $regex: new RegExp(searchTerm, "i") } },
          { genre: { $regex: new RegExp(searchTerm, "i") } },
        ];
      }

      if (genre !== "null") {
        filter.genre = genre;
      }

      if (publicationDate !== "null") {
        filter.publicationDate = publicationDate;
      }

      // Exclude publicationDate condition if publicationDate is not defined
      if (!publicationDate) {
        delete filter.publicationDate;
      }

      // Exclude genre condition if genre is not defined
      if (!genre) {
        delete filter.genre;
      }

      const cursor = bookCollection.find(filter);
      const books = await cursor.toArray();
      console.log(books);

      res.send({ status: true, data: books });
    });

    app.get("/featuredBooks", async (req, res) => {
      let filter = {};

      const cursor = bookCollection.find(filter);
      const books = await cursor.toArray();
      console.log("featured books", books);

      res.send({ status: true, data: books });
    });

    // app.get("/books", async (req, res) => {
    //   const { searchTerm, genre, publicationDate } = req.query;

    //   console.log("searchTerm", searchTerm, genre, publicationDate);

    //   const filter = {};

    //   // Add filters based on query parameters
    //   const regex = searchTerm ? new RegExp(searchTerm, "i") : null;

    //   if (searchTerm) {
    //     filter.$or = [
    //       { title: { $regex: regex } },
    //       { author: { $regex: regex } },
    //       { genre: { $regex: regex } },
    //     ];
    //   }

    //   if (genre) {
    //     filter.genre = genre;
    //   }

    //   if (publicationDate) {
    //     filter.publicationDate = publicationDate;
    //   }

    //   // Exclude publicationDate condition if publicationDate is not defined
    //   if (!publicationDate) {
    //     delete filter.publicationDate;
    //   }

    //   // Exclude genre condition if genre is not defined
    //   if (!genre) {
    //     delete filter.genre;
    //   }

    //   const cursor = bookCollection.find(filter);
    //   const books = await cursor.toArray();
    //   console.log(books);

    //   res.send({ status: true, data: books });
    // });

    app.post("/book", async (req, res) => {
      console.log("post book");

      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });
    app.put("/book/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };

      console.log("put book");
      const updatedBook = req.body;
      console.log(updatedBook, id);

      const options = { upsert: true };
      const Book = {
        $set: {
          title: updatedBook.title,
          author: updatedBook.author,
          genre: updatedBook.genre,
          publicationDate: updatedBook.publicationDate,
          photo: updatedBook.photo,
          email: updatedBook.email,
        },
      };

      const resutl = await bookCollection.updateOne(filter, Book, options);

      // const result = await bookCollection.insertOne(book);

      // res.send(result);
    });
    // app.post("/book", async (req, res) => {
    //   const rawBody = req.body;
    //   console.log("Raw Body:", rawBody);

    //   try {
    //     const book = JSON.parse(rawBody);
    //     const result = await bookCollection.insertOne(book);
    //     res.send(result);
    //   } catch (error) {
    //     console.error("Error:", error);
    //     res.status(400).send("Invalid JSON");
    //   }
    // });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      console.log("single book");
      console.log(id);

      const result = await bookCollection.findOne({ _id: new ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.post("/comment/:id", async (req, res) => {
      const bookId = req.params.id;
      const comment = req.body.comment;

      console.log(bookId);
      console.log(comment);

      const result = await bookCollection.updateOne(
        { _id: new ObjectId(bookId) },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("book not found or comment not added");
        res.json({ error: "book not found or comment not added" });
        return;
      }

      console.log("Comment added successfully");
      res.json({ message: "Comment added successfully" });
    });

    app.get("/comment/:id", async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: new ObjectId(bookId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "book not found" });
      }
    });

    app.post("/user", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
