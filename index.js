require('dotenv').config()
const express = require('express')
const app = express()
const request = require('request')
const cheerio = require('cheerio')

app.get('/hackernews', function (req, res) {
  const page = req.query.page
  let result = {news: []}
  request(`https://news.ycombinator.com/news?p=${page}`, (er, re, body) => {
    let $ = cheerio.load(body)
    $('.athing').each((i, e) => {
      let currentNews = {
        id: $(e).attr('id'),
        link: $(e).find('.title a').attr('href'),
        title: $(e).find('.title a').text()
      }
      result.news.push(currentNews)
    })
    res.send(JSON.stringify(result))
  })
})

app.listen(process.env.PORT)
