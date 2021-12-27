const http = require('http');
var suncalc = require('suncalc')
const fs = require('fs')

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

var end = new Date(2019, 0, 1)
var daylength = []

function fetchDaylength(){
    for(let d = new Date(2018, 0, 2); d <= end; d.setDate(d.getDate() + 1)){
        //console.log(suncalc.getTimes(d, 50.467388, 4.871985))
        daylength.push(86400000 - (suncalc.getTimes(d, 50.467388, 4.871985).sunset - suncalc.getTimes(d, 50.467388, 4.871985).sunrise))
    }
    const sum = daylength.reduce((a,b) => a + b, 0);
    const avg = (sum / daylength.length) || 0;

    console.log("La durée moyenne d'une nuit à Namur en 2018 est de " + msToTime(avg)+ ".")
}


function msToTime(duration) {
    var milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes ;
  }

function readJson(){
    let rawdata = fs.readFileSync('pietons.json')
    let data = JSON.parse(rawdata)
    pietonCountByDate = data.filter(row => {
        dateCurrent = new Date(row.fields.date)
        if(dateCurrent.getHours() >= 20 || (dateCurrent.getHours() <= 7 && dateCurrent.getMinutes() <= 44)){
            return dateCurrent
        }
    }
    )
    var pietonCountByHours = {}
    for(let i = 0; i < 24; i++){
        for(let j = 0; j < pietonCountByDate.length; j++){
            dateCurrent = new Date(pietonCountByDate[j].fields.date)
            if(dateCurrent.getHours() == i){
                var datum = dateCurrent.getHours()
                if(!pietonCountByHours[datum]){
                    pietonCountByHours[datum] = []
                }
                pietonCountByHours[datum].push(pietonCountByDate[j].fields.rue_de_fer_pair + pietonCountByDate[j].fields.rue_de_fer_impair)
            }
        }
    }
    for(let i = 0; i < 24; i++){
        if(pietonCountByHours[i] != undefined){
            for(let j = 0; j < pietonCountByHours[i].length; j++){
                const sum = pietonCountByHours[i].reduce((a,b) => a + b, 0);
                const avg = (sum / pietonCountByHours[i].length) || 0;
                pietonCountByHours[i] = avg
                console.log("Il y a en moyenne "+ pietonCountByHours[i] + " personnes dans la rue de fer entre " + i + " heure et " + (i+1) + "heure sur toute l'année 2018.")
                for(let t = 10; t <= 100; t+=10){
                    let nbPietons = (pietonCountByHours[i] * (t / 100))
                    console.log("pour "+ t + "% : " + nbPietons)
                    let timingPassage = 60 / nbPietons
                    if(timingPassage > 4){
                        console.log("Il y aura 1 personne toutes les " + timingPassage + ". le système sera coupé pendant " + (timingPassage - 4) * nbPietons)
                    }
                }
            }
        }
    }

}


server.listen(port, hostname, () => {
    fetchDaylength()
    readJson()
    
  console.log(`Server running at http://${hostname}:${port}/`);
});