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
    //set user agent
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
  handleError: function() {

  },

  /**Uses the namespace's articles array of object literals to update DOM*/
  updateDOM: function() {
    var storedData = JSON.parse(localStorage.getItem("deep_sea_articles"));
    if(storedData) {

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
      News.updateDOM();
    }
  }
};

document.addEventListener("DOMContentLoaded", News.beginNewSession);
