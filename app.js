//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
   useFindAndModify: false
});
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Eat breakfast"
});
const item2 = new Item({
  name: "Eat breakfast"
});
const item3 = new Item({
  name: "Eat breakfast"
});
//const day = date.getDate();
const defaultItems = [item1, item2, item3];

const listSchema= {
  name: String,
  items:[itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err)
          } else {
            console.log("success")
          }
        })
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }});
  }

);

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
    const listName=req.body.list;

  const item=new Item({name:itemName});
  console.log(listName);
  console.log(item);
  if (listName==="Today"){
  item.save();
  res.redirect("/");}
  else{

    List.findOne({name:listName},function(err,foundList){

      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});

app.get("/:catName", function(req, res) {
  const listName = req.params.catName;

List.findOne({name:listName},function(err,foundList){
if(foundList){
  res.render("list",{
    listTitle: listName,
    newListItems: foundList.items
  });

}
else if(! foundList){
  const list=new List({name: listName,
  items:defaultItems});
  list.save();
}


});

});

app.post("/delete",function(req,res){
const hidden=req.body.hidden;
console.log(hidden);
  const check=req.body.checkbox;
  if (hidden==="Today"){
  Item.findByIdAndRemove(check,function(err){
    console.log(err);
res.redirect("/");
  });
    }
    else{
      List.findOneAndUpdate(
        {name:hidden},{$pull:{items:{_id:check}}},function(err,results){
            if(!err){
                res.redirect("/"+hidden);
                    }
                  }
                    );
                  }


}
);

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
