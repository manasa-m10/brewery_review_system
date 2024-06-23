const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3003;

const MONGO_URI = 'mongodb+srv://manasamurali1014:SH2kZPCnnv3TsM4J@brs.lvk3lpx.mongodb.net/?retryWrites=true&w=majority&appName=BRS';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

app.use(cors());
app.use(express.json());

const reviewSchema = new mongoose.Schema({
    breweryName: String,
    reviewerName: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

app.get('/search', async (req, res) => {
    const { name, city, type } = req.query;
    let url = 'https://api.openbrewerydb.org/breweries';

    if (name) {
        url += `?by_name=${name}`;
    } else if (city) {
        url += `?by_city=${city}`;
    } else if (type) {
        url += `?by_type=${type}`;
    }

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

app.get('/brewery', async (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ message: 'Brewery name is required' });
    }

    try {
        const response = await axios.get(`https://api.openbrewerydb.org/breweries?by_name=${name}`);
        const brewery = response.data[0];

        if (brewery) {
            const breweryDetails = {
                name: brewery.name,
                address: `${brewery.street}, ${brewery.city}, ${brewery.state}`,
                phone: brewery.phone,
                website: brewery.website_url,
                rating: 'N/A', 
                reviews: 'N/A' 
            };
            res.json(breweryDetails);
        } else {
            res.status(404).json({ message: 'Brewery not found' });
        }
    } catch (error) {
        console.error('Error fetching brewery details:', error);
        res.status(500).json({ message: 'Error fetching brewery details' });
    }
});

app.post('/submit-review', async (req, res) => {
    const { breweryName, reviewerName, rating, comment } = req.body;

    if (!breweryName || !reviewerName || rating == null || !comment) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const newReview = new Review({
        breweryName,
        reviewerName,
        rating,
        comment
    });

    try {
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ message: 'Error saving review' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
