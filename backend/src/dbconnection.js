
const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect('mongodb+srv://melbimathew2025:pkBvoV7Z4pTuioUH@cluster0.pxpyihi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; 
  }
}

module.exports = { connect };
