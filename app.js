const express = require('express');
const app = express();

const users = [{"id":"Universidad Católica Popular del Risaralda","email":"jmacascaidh0@blinklist.com","gender":"Male","profilepic":"https://robohash.org/asperioressuscipitblanditiis.png?size=50x50&set=set1"},
{"id":"State Film, Television and Theatre Higher School Leon Schiller in Lodz","email":"dgrabiec1@merriam-webster.com","gender":"Male","profilepic":"https://robohash.org/adipiscidoloresimpedit.png?size=50x50&set=set1"},
{"id":"Bauder College","email":"jroly2@chronoengine.com","gender":"Female","profilepic":"https://robohash.org/iuresitnihil.png?size=50x50&set=set1"},
{"id":"Beth-El College of Nursing and Health Sciences","email":"gkuscha3@walmart.com","gender":"Female","profilepic":"https://robohash.org/doloremeosducimus.png?size=50x50&set=set1"},
{"id":"Vaasa University of Applied Sciences","email":"kseemmonds4@marketwatch.com","gender":"Female","profilepic":"https://robohash.org/officiisvelitreprehenderit.png?size=50x50&set=set1"},
{"id":"Technical University of Koszalin","email":"fmccuaig5@admin.ch","gender":"Male","profilepic":"https://robohash.org/eiusadipisciquo.png?size=50x50&set=set1"},
{"id":"Agricultural University of Warsaw","email":"glemarquis6@technorati.com","gender":"Male","profilepic":"https://robohash.org/quiadebitisexpedita.png?size=50x50&set=set1"},
{"id":"Université des Sciences et de la Technologie d'Oran","email":"rrain7@posterous.com","gender":"Male","profilepic":"https://robohash.org/aspernaturnonsequi.png?size=50x50&set=set1"},
{"id":"Celal Bayar University","email":"obrugsma8@geocities.jp","gender":"Female","profilepic":"https://robohash.org/hicsittempora.png?size=50x50&set=set1"},
{"id":"Perm State Pedagogical University","email":"rwestbrook9@alibaba.com","gender":"Female","profilepic":"https://robohash.org/eaundesint.png?size=50x50&set=set1"},
{"id":"Dares Salaam Institute of Technology","email":"chessela@163.com","gender":"Female","profilepic":"https://robohash.org/eaqueuteum.png?size=50x50&set=set1"},
{"id":"McKendree College","email":"amarteb@usgs.gov","gender":"Male","profilepic":"https://robohash.org/aliquidcumperspiciatis.png?size=50x50&set=set1"},
{"id":"Fachhochschule Schmalkalden","email":"hmacc@pcworld.com","gender":"Female","profilepic":"https://robohash.org/consequaturfugitsit.png?size=50x50&set=set1"},
{"id":"Barton College","email":"atrottond@privacy.gov.au","gender":"Female","profilepic":"https://robohash.org/aspernaturminimaearum.png?size=50x50&set=set1"},
{"id":"Hogeschool voor Wetenschap & Kunst","email":"rcozzie@jigsy.com","gender":"Male","profilepic":"https://robohash.org/odiosuntvoluptatem.png?size=50x50&set=set1"},
{"id":"Nanjing Forestry University","email":"mblaberf@msu.edu","gender":"Female","profilepic":"https://robohash.org/perspiciatisdoloribusvoluptas.png?size=50x50&set=set1"},
{"id":"Philadelphia University","email":"zlaskeyg@hugedomains.com","gender":"Male","profilepic":"https://robohash.org/voluptatesperspiciatisautem.png?size=50x50&set=set1"},
{"id":"Universidade Regional de Blumenau","email":"bkinghh@paginegialle.it","gender":"Male","profilepic":"https://robohash.org/magnamseddignissimos.png?size=50x50&set=set1"}]


app.get('/students',paginateResults(users),(req, res)=>{
    res.send(res.paginatedResults);
})

app.get('/courses',(req, res)=>{

})

app.get('/users',(req, res)=>{

})


function paginateResults (model){
    return (req,res,next) =>{
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let startIndex = (page - 1) * limit;
        let endIndex = page * limit;
        let results = model.slice(startIndex, endIndex);
        let response = {};
        response.results=results;
    
        if(endIndex<model.length){
        response.next = {
            page: page+1,
            limit: limit
        }
        }
    
        if(startIndex>0){
        response.prevous = {
            page: page-1,
            limit: limit
        }
        }
        
        res.paginatedResults = response;
        next()
    } 
}

app.listen(3000)