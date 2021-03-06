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
    //If there are less than 27 articles, choose that amount
    var articleCount = data.length < 27 ? data.length : 27;
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
    //Save the position of how many articles are being displayed
    News.shownArticleCount = News.articles.length < 9 ? News.articles.length : 9;
    News.currentIndex = 0;
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

    if(News.articles) {
      //Total row count
      var rowCount = Math.floor((News.shownArticleCount - News.currentIndex) / 3);
      if(News.shownArticleCount % 3 !== 0) {
        rowCount++;
      }

      for(var i = 0; i < rowCount; i++) {
        //If last row --> use the mod value else use 3
        var colCount = (i === rowCount - 1) ?
          (News.shownArticleCount % 3 === 0 ? 3 : News.shownArticleCount % 3) : 3;

        //Individual row
        var row = document.createElement("div");
        row.classList.add("news_row");
        newsContainer.appendChild(row);

        //Iterate through the columns of that row
        for(var j = 0; j < colCount; j++) {
          //var current = News.articles[i * colCount + j];
          var current = News.articles[News.currentIndex];

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

          News.currentIndex++;
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
   * Gets the count of days in the previous month.
   * Takes into consideration the issues surrounding start of
   * new year and Date methods 0-indexed.
   */
  getPreviousMonthDayCount: function() {
    var now = new Date();
    // Get the year of the previous month taking into consideration January
    // will return -1 (due to 0 index).
    var year = now.getMonth() < 0 ? now.getFullYear() - 1 : now.getFullYear();
    // now.getMonth() is 0 indexed so it will automatically give the previous month
    var month = now.getMonth() === 0 ? 12 : now.getMonth();
    return new Date(year, month, 0).getDate();
  },

  loadMoreArticles: function() {
    return function() {
      //if there are more than 9 left return 9, if there are 9 return 9
      //else return what ever is left
      var next = (News.articles.length - News.shownArticleCount) > 9 ?
        9 : (News.articles.length - News.shownArticleCount) === 9 ?
        9 : News.articles.length - News.shownArticleCount;
      News.shownArticleCount = News.shownArticleCount + next;
      if(News.articles.length > News.shownArticleCount) {
        News.updateDOM();
      } else {
        News.updateDOM();
        var load = U.$("load_div");
        var page = document.querySelector("section.page_content");
        page.removeChild(load);
      }
    };
  },

  /**
   * Set the expiry date to tomorrow then can check if they are the same
   * If they are, then make a new request else use that
   */
  beginNewSession: function() {
    var loadMore = U.$("load_more_articles");
    document.addEventListener("click", News.loadMoreArticles());

    var keyword = encodeURIComponent("\"Deep sea\"");
    
    // var today = News.getFormattedDate(-28, "-");
    var prevMonthCount = News.getPreviousMonthDayCount();
    var today = News.getFormattedDate(- prevMonthCount, "-");


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
      var articles = localStorage.getItem("deep_sea_articles");
      News.articles = JSON.parse(articles);
      //Save the position of how many articles are being displayed
      News.shownArticleCount = News.articles.length < 9 ? News.articles.length : 9;
      News.currentIndex = 0;
      //Update DOM with existing content
      News.updateDOM();
    }
  }
};

document.addEventListener("DOMContentLoaded", News.beginNewSession);
