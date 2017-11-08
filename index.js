require('dotenv').config()
const express = require('express')
const app = express()
const request = require('request')
const cheerio = require('cheerio')
const summarize = require('summarize')

class News {

  constructor(...args) {
    this.state = {
      news: [],
      summaries: []
    }
  }

  init() {
    this.initNews();
    this.initSummary();
  }

  initNews() {
    const self = this;
    app.get('/hackernews', function (req, res) {
      self.getNews(req.query.page)
          .then(res.send(JSON.stringify(self.state.news)))
    })
  }

  getNews(page) {
    const self = this;
    return new Promise((resolve, reject) => {
      request(`https://news.ycombinator.com/news?p=${page}`, (er, re, body) => {
        if (er) {
          reject('error');
        }
        let $ = cheerio.load(body)
        $('.athing').each((i, e) => {
          let currentNews = {
            id: $(e).attr('id'),
            link: $(e).find('.title a').attr('href'),
            title: $(e).find('.title a').text()
          }
          self.state.news.push(currentNews)
        })
        resolve('success');
      })
    })
  }

  initSummary() {
    const self = this;
    app.get('/summary/:newsId', function (req, res) {
      console.log(req.params.newsId);
      const article = self.state.news.filter(x => x.id == req.params.newsId);
      console.log(article);
      res.send(article)
    })
  }
}

const news = new News();

news.init();

app.listen(process.env.PORT)
