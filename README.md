# hackernews_api 
Turns HackerNews into an API and makes summaries out of the posts from their website.

Example response when requesting a summary:

```
{"id":15685541,
"link":"http://www.bkav.com/d/top-news/-/view_content/content/103968/face-id-beaten-by-mask-not-an-effective-security-measure",
"sentiment":"0.02929427430093209",
"title":"Face ID beaten by mask, not an effective security measure",
"topics":"mask,Bkav,security measure,technology,user,world,iphone x,kind,right,laptop,face recognition,show,firm,leader,issue,artist,nose,network,team,product,Asu,Lenovo,Toshiba,first company,Bphone,detail,clip,D model,corporation,attack,year,target,Concept,Proof,smartphone,example,link,cyber,attempt,experiment,train,makeup,Schiller,Phil,President,Vice,Vietnam,com / bphone,answer,competitor,Security,nation,asset,skin,FBI,PoC,device,hacker,half,point,principle,purpose,part,photo,craft,way,person,area,silicone,end,trick apple,image,Apple Face ID,time",
"words":1575,
"difficulty":"0.6833333333333332",
"minutes":12,
"image":"http://www.bkav.com/documents/10192/0/set.png"}
```

Live example deployed with Heroku: 

- https://hnapi.herokuapp.com/hackernews?entries=10
- https://hnapi.herokuapp.com/summaries?entries=10

The crawler will check every 30 minutes for new content on HackerNews, and turns the news into summaries every 10 minutes/

## TODO

- Mix the news from hackernews with other sources (e.g. /r/worldnews)
- Make a frontend implementation rethinking hackernews' layout

-----

[HackerNews](https://news.ycombinator.com/news)
