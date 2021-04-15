const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'


mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db= mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",() => {
    console.log("Database connected");
});

const sample= array => array[Math.floor(Math.random()* array.length)];

const seedDB = async() =>
{
    await Campground.deleteMany({});
    for(let i=0;i<200;i++)
    {
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            title:`${sample(descriptors)} ${sample(places)}`,
            images:[
                {
                  url: 'https://res.cloudinary.com/simran567/image/upload/v1616616155/YelpCamp/xcoqj8aveae6rnngwgfh.jpg',
                  filename: 'YelpCamp/xcoqj8aveae6rnngwgfh'
                },
                {
                  url: 'https://res.cloudinary.com/simran567/image/upload/v1616616156/YelpCamp/z04nwitikznxnq5zy0r2.png',
                  filename: 'YelpCamp/z04nwitikznxnq5zy0r2'
                }
              ],
            author: '6053b7f94677b52c10fdc2c6',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicious',
            price,
            geometry: {
                type:"Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
            ]
            }
           
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})