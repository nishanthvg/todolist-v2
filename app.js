//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = [];
// const workItems = [];
//Replacing it with mongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

//schema 
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

//Elements in the collection 
const item1 = new Item ({
  name: "Welcome to todo list"
});

const item2 = new Item({
  name: "Hit the + button to sdd a new item"
});

const item3 = new Item ({
  name: "<-- Hit this to delte an item"
});

const defaultItems = [item1,item2,item3];

//new collections for params 

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

/* ****** */

app.get("/", function(req, res) {

  // Logging the items - mongodb
  Item.find((err,items) => {
    if(items.length === 0) {
      //InsertMany - all the default item into mogodb
        Item.insertMany(defaultItems,(err)=> {
          if(err) {
            console.log(err)
          } else {
            console.log("Successafully added the default items")
          }
        });
        res.redirect("/") // FOr the website to displaythe items
    } else {   
        res.render("list", {listTitle: "Today", newListItems: items});
      }
  });
    /* ****** */
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  })

  if(listName === "Today") {
    item.save();
    res.redirect("/") // FOr the website to displaythe items
  } else {
    List.findOne({name:listName},(err,foundItem) => {
      if(!err) {
        foundItem.items.push(item);
        foundItem.save();
        res.redirect("/" + listName);
      }
    })
    
  }
});

/* ***** */
app.post("/delete",(req,res) => {
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if(err) {
        console.log(err)
      } else {
        console.log("Successfully removed the checked item")
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId}}},(err,foundaList) => {
      if(!err) {
        res.redirect("/" + listName); 
      }
    });
  }
})

/* **** */
//For params - diff routes 
app.get("/:customListName",(req,res) => {
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName},(err,foundItem) => {
    if(err) {
      console.log(err)
    } 
    else {
      if(!foundItem) {
        //Creating a new element 
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName)
      } 
      else {
        //displaying the existing list items 
        res.render("list", {listTitle: foundItem.name, newListItems: foundItem.items})
      }
    }
  })
  

})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
