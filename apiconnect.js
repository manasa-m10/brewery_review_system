const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
