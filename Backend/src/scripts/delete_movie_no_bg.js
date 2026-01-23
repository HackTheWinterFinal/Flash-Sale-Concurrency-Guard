const mongoose = require('mongoose');
const path = require('path');
const Movie = require('../models/Movie');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const deleteMovieNoBg = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Find the first movie (oldest) where backgroundUrl is null, undefined, or empty string
    const movie = await Movie.findOne({
      $or: [
        { backgroundUrl: { $exists: false } },
        { backgroundUrl: null },
        { backgroundUrl: "" }
      ]
    }).sort({ createdAt: 1 });

    if (!movie) {
      console.log("No movie found without a background image.");
    } else {
      console.log(`Found movie to delete: ${movie.title} (ID: ${movie._id})`);
      await Movie.deleteOne({ _id: movie._id });
      console.log(`Successfully deleted movie: ${movie.title}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Deletion failed:", error);
    process.exit(1);
  }
};

deleteMovieNoBg();
