const mongoose = require("mongoose");

var Campground = require("./models/campground.js");
var Comment = require("./models/comment.js");

var data = [
    {
        name: "Sea Paradise Beach Huts",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/03/a7/44/db/sea-paradise-beach-huts.jpg",
        description: "Lovely clean place right on the beach with friendly staff and excellent food."
    }, 
    {
        name: "Blu Resorts",
        image: "https://s-ec.bstatic.com/images/hotel/max1280x900/174/174945238.jpg",
        description: "Awesome property. Close by to all the attractions near vagator , Anjuna n ozran beaches."
    }
]


// delete all campgrounds in databse
function seedDB() {
    Campground.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        }
        console.log("Campgrounds deleted");
        
        // adding a few campgrounds
        data.forEach((seed) => {
            Campground.create(seed, (err, campground) => {
                if(err) {
                    console.log(err);
                }
                else {
                    console.log("Added new campground");
                    
                    // create a comment
                    Comment.create({
                        text: "This is a great place to spend your holiday",
                        author: "Yash"
                    }, (err, comment) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            campground.comments.push(comment);
                            campground.save();
                            console.log("New comment created");
                        }
                    });
                }
            });
        });
    });
}

module.exports = seedDB;
