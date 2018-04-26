"use strict";

var g = {
  slideImages: [
    "great_blue_hole.jpg",
    "great_blue_hole2.jpg",
    "great_blue_hole3.jpg"
  ],

  images: [],

  currentImgIndex: 0
}

//preload the images of the slideshow into the
//array of image objects.
var preloadImages = function() {
  g.slideImages.forEach(function(image, index) {
    var img = document.createElement("img");
    img.setAttribute("src", "content/" + image);
    img.setAttribute("alt", "image of great blue hole");
    img.style.height = "400px";
    img.style.width = "700px";
    g.images[index] = img;
  });
}();

function changeImage(e) {
  var target = e.target;
  if(target.id === "button_left") {
    switchImage(-1);
  } else {
    switchImage(1);
  }
}

function switchImage(step) {
  if(g.currentImgIndex + step >= g.images.length) {
    g.currentImgIndex = 0;
  } else if(g.currentImgIndex + step < 0) {
    g.currentImgIndex = g.images.length - 1;
  } else {
    g.currentImgIndex += step;
  }
  g.imageDiv.firstElementChild.replaceWith(g.images[g.currentImgIndex]);
}


document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
  g.imageDiv = U.$("current_img");
  var arrowDiv = U.$("slide_button_wrapper");
  arrowDiv.addEventListener("click", changeImage, true);
}
