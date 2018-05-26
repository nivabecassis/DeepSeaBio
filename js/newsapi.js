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
    localStorage.setItem("deep_seas_articles", JSON.stringify(News.articles));
    //Update DOM with new content
    News.updateDOM();
  },

  /**Display something to users indicating that there was an error*/
  handleError: function() {

  },

  /**Uses the namespace's articles array of object literals to update DOM*/
  updateDOM: function() {

  },

  /**
   * Check if localStorage has anything in it than use that, otherwise
   * make a new call to the server to get more data
   */
  beginNewSession: function() {

  }



};
