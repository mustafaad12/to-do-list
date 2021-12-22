// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const date = require(__dirname + "/date.js");
const _ = require("lodash");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://mustafa-aldaffaie:MUSTAFA1997ABChorizonA@cluster0.n4i8i.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todolist."
});

const item2 = new Item({
  name: "hit + button to add a new item."
});

const item3 = new Item({
  name: "<-- hit this to delete the item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
  const day = date.getDate();

  Item.find({}, function(err, itemsFound){
    if(itemsFound.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle:"Today", newListItems: itemsFound});
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        //show an exist listing
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});



app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});


app.post("/delete", function(req, res){
  const checkeditemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkeditemId, function(err){
      if(!err){
        console.log("successfully removed the item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkeditemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/work", function(req, res){
  res.render("list", {listTitle:"work list", newListItems:workItems});
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("server startes on port 3000");
});
