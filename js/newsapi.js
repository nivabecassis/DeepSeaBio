"use strict";

/*
 * Make request to api for a specific keyword and look at response.
 * Want the top 9 articles for that keyword and sort by most recent.
 * If its the first time for the user, save the data to localStorage.
 * If it is not their first time, check localStorage and see if they have
 * the data from TODAY. If it is not expired than use that. If it is
 * expired than make a new request.
 */

var News = {

  articles: [],

  makeHttpRequest: function(url, callback, errorCb) {
    //TODO: set api user-agent
    var r = new XMLHttpRequest();
    r.open("GET", url, true);
    r.addEventListener("load", function() {
      if(r.readyState === XMLHttpRequest.DONE && r.status === 200) {
        callback(r.responseText);
      } else {
        console.log("There was an error when communicating with the server");
      }
    });
    r.addEventListener("error", function() {
      errorCb(r.status);
    });
    r.send();
  },

  /**Add all the data to a object literal and push that to the array of articles*/
  handleResponse: function(responseText) {
    var data = JSON.parse(responseText).articles;
    //If there are less than 9 articles, choose that amount
    var articleCount = data < 9 ? data.length : 9;
    //Get all the info about each article
    for(var i = 0; i < articleCount; i++) {
      var article = {};
      article.source = data[i].source.name;
      article.title = data[i].title;
      article.description = data[i].description;
      article.url = data[i].url;
      article.imgSrc = data[i].urlToImage;
      //Add the new article to the articles array
      News.articles.push(article);
    }
    //Update the stored articles
    localStorage.setItem("deep_sea_articles", JSON.stringify(News.articles));
    //Update DOM with new content
    News.updateDOM();
  },

  /**Display something to users indicating that there was an error*/
  handleError: function(status) {
    var newsContainer = U.$("news_boxes_container");
    News.removeAllChildren(newsContainer);
    News.addMessageToDOM("There was an error when communicating with the server. " +
      "server status code: " + status);
  },

  /**Uses the namespace's articles array of object literals to update DOM*/
  updateDOM: function() {
    var newsContainer = document.querySelector(".news_boxes_container");
    News.removeAllChildren(newsContainer);

    if(News.articles) {
      //Total row count
      var rowCount = News.articles.length / 3;
      if(News.articles.length % 3 !== 0) {
        rowCount++;
      }

      for(var i = 0; i < rowCount; i++) {
        //If last row --> use the mod value else use 3
        var colCount = (i === rowCount - 1) ?
          (News.articles.length % 3 === 0 ? 3 : News.articles.length % 3) : 3;

        //Individual row
        var row = document.createElement("div");
        row.classList.add("news_row");
        newsContainer.appendChild(row);

        //Iterate through the columns of that row
        for(var j = 0; j < colCount; j++) {
          //TODO: review this algorithm
          var current = News.articles[i * colCount + j];

          //Individual news box
          var box = document.createElement("div");
          box.classList.add("news_box");

          var backgroundImg = document.createElement("img");
          backgroundImg.src = current.imgSrc;
          backgroundImg.alt = "article image";
          box.appendChild(backgroundImg);

          var titleDiv = document.createElement("div");
          var title = document.createElement("h3");
          var a = document.createElement("a");
          a.href = current.url;
          a.textContent = current.title;
          title.appendChild(a);
          titleDiv.appendChild(title);
          titleDiv.classList.add("news_title_div");

          box.appendChild(titleDiv);
          row.appendChild(box);
        }
      }
    }
  },

  /**Adds a message to the beginning of the news section*/
  addMessageToDOM: function(msg) {
    var div = document.createElement("div");
    var newsContainer = U.$("news_boxes_container");
    newsContainer.prepend(div);
    var par = document.createElement("p");
    par.textContent = msg;
    newsContainer.appendChild(par);
  },

  /**Remove all children for a container*/
  removeAllChildren: function(parent) {
    while(parent.firstElementChild) {
      parent.removeChild(parent.firstElementChild);
    }
  },

  /**Gets a new String date with the step that is formatted with the '/' char*/
  getFormattedDate: function(step, formatChar) {
    var date = new Date();
    date = new Date(date.setDate(date.getDate() + step));
    var year = date.getFullYear();
    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
    var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return year + formatChar + month + formatChar + day;
  },

  /**
   * Set the expiry date to tomorrow then can check if they are the same
   * If they are, then make a new request else use that
   */
  beginNewSession: function() {
    var keyword = encodeURIComponent("\"Deep sea\"");
    var today = News.getFormattedDate(-30, "-");

    var url = 'https://newsapi.org/v2/everything?' +
              'q=' + keyword + '&' +
              'from=' + today + '&' +
              'sortBy=popularity&' +
              'apiKey=4a07367f8f84463ab79d04eae9550150';
    var expiryUrl = url + ";expiry";
    var expiry = localStorage.getItem(expiryUrl);

    if(!expiry) {
      //First time
      localStorage.setItem(url + ";expiry", News.getFormattedDate(1, "-"));
      News.makeHttpRequest(url, News.handleResponse, News.handleError);
    } else if(News.getFormattedDate(0, "-") === expiry) {
      //Expired
      localStorage.setItem(url + ";expiry", News.getFormattedDate(1, "-"));
      News.makeHttpRequest(url, News.handleResponse, News.handleError);
    } else if(News.getFormattedDate(0, "-") < expiry) {
      //Valid
      News.articles = JSON.parse(localStorage.getItem("deep_sea_articles"));
      News.updateDOM();
    }
  }
};

document.addEventListener("DOMContentLoaded", News.beginNewSession);
