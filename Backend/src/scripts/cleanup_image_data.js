const mongoose = require('mongoose');
const path = require('path');
const Movie = require('../models/Movie');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const cleanup = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // The snippet provided by user starts with: data:image/jpeg;base64,/9j/
    const prefix = "data:image/jpeg;base64,/9j/";

    // Find movies with posterUrl or backgroundUrl starting with this prefix (or just data:image generic)
    const movies = await Movie.find({
      $or: [
        { posterUrl: { $regex: /^data:image/ } },
        { backgroundUrl: { $regex: /^data:image/ } }
      ]
    });

    console.log(`Found ${movies.length} movies with base64 image data.`);

    for (const movie of movies) {
      let updated = false;
      if (movie.posterUrl && movie.posterUrl.startsWith('data:image')) {
        console.log(`Cleaning posterUrl for movie: ${movie.title}`);
        movie.posterUrl = 'https://placehold.co/300x450/png?text=Poster'; 
        updated = true;
      }
      if (movie.backgroundUrl && movie.backgroundUrl.startsWith('data:image')) {
        console.log(`Cleaning backgroundUrl for movie: ${movie.title}`);
        movie.backgroundUrl = 'https://placehold.co/1920x1080/png?text=Background';
        updated = true;
      }

      if (updated) {
        await movie.save();
        console.log(`Updated movie: ${movie.title}`);
      }
    }

    console.log("Cleanup completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
};

cleanup();
