var express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8080;
let teamsArray = [];

/* GET home page. */
app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname,'./Client/index.html'))
});

/* GET Teams Data from JSON. */

app.get('/teams', function(req, res, next) {
  fs.readFile('./Client/teams.json', function(err, data){
    res.setHeader('Content-Type', 'application/json');
    res.type('application/json');
    var responseArr = JSON.parse(data).ResponseArray;
    if(responseArr!=undefined){
      response = {result:responseArr,status:200}
    }else{
      response = {error:"Something Went Wrong",status:500}
    }
    res.send(response); 
    teamsArray = responseArr;
  })
});

///////////////////Calculation API///////////////////

app.get('/calculateNRR', function(req, res, next) {
  results = calculateResults(req.query);
  res.setHeader('Content-Type', 'application/json');
  response ={result: results, status:200};
  res.send(response); 
});

function calculateResults(dataObj){
  if(((teamsArray[(dataObj.team1)-1].won*2)+2)<(teamsArray[(dataObj.position)-1].won*2)){
    var arr = [];
    arr.push({"message":"You cannot reach position " +dataObj.position+" after winning by any margin"});
    return arr;
  }else if(((teamsArray[(dataObj.team1)-1].won*2)+2)>(teamsArray[(dataObj.position)-1].won*2)){
    var arr = [];
    arr.push({"message":"You can reach position " +dataObj.position+" after winning by any margin"});
    return arr;
  }else if(((teamsArray[(dataObj.team1)-1].won*2)+2)==(teamsArray[(dataObj.position)-1].won*2)){
    var selfObj = teamsArray[(dataObj.team1)-1];
    var againstObj = teamsArray[(dataObj.team2)-1];
    var highObj = teamsArray[(dataObj.position)-2];
    var positionObj = teamsArray[(dataObj.position)-1];
    if(dataObj.innings==1){
      if(highObj.won*2==((selfObj.won*2)+2)){
        var selftotalruns = Number(selfObj.Run_Scored) + Number(dataObj.runs);
        var selfovers =  Number(selfObj.Overs) + Number(dataObj.overs_bowls);
        var attr1 = 0;
        var attr2 = 0;
        ////////////////////////////////////////////////////////////////////////
        if(dataObj.position==dataObj.team2){
          var highNRR = highObj.NRR;
          var preNRR=0;
          var aggNRR=0;
          for(i=1;i<dataObj.runs;i++){
            preNRR=selfNRR;
            aggNRR=againstNRR;
            var selfNRR =  (selftotalruns/selfovers) - ((selfObj.Run_Against+i)/(selfObj.Overs_Bowl+20));
            var againstNRR = ((Number(againstObj.Run_Scored)+i)/(Number(againstObj.Overs) +20)) - ((againstObj.Run_Against+Number(dataObj.runs))/(againstObj.Overs_Bowl+Number(dataObj.overs_bowls)));
            if(selfNRR>=highNRR){
              attr1 = i;
            }else if(selfNRR>againstNRR){
              if(i==dataObj.runs-1){
                attr2 = i;
                var arr = [];
                arr.push({"message":"You should restrict " + againstObj.team +" between " +attr1 +" and " + attr2 + " runs to reach postion " +dataObj.position+ "!!"
                        ,"SelfNRR":preNRR,"againstNRR":aggNRR
              });
                return arr
              }else{
                attr2 = i;
              } 
            }else{
              var arr = [];
              arr.push({"message":"You should restrict " + againstObj.team +" between " +attr1  + " and " + attr2 + " runs to reach postion " +dataObj.position+ "!!"
                      ,"SelfNRR":preNRR,"againstNRR":aggNRR
            });            }
          }
          //////////////////////////////////////////////////////////////////////
        }else if(dataObj.team2==(dataObj.position-1)){
          var lowNRR = positionObj.NRR;
          var preNRR = 0;
          var aggNRR = 0;
          for(i=1;i<dataObj.runs;i++){
            preNRR = selfNRR;
            aggNRR=highNRR
            var selfNRR =  (selftotalruns/selfovers) - ((selfObj.Run_Against+i)/(selfObj.Overs_Bowl+20));
            var highNRR = ((Number(highObj.Run_Scored)+i)/(Number(highObj.Overs) +20)) - ((highObj.Run_Against+Number(dataObj.runs))/(highObj.Overs_Bowl+Number(dataObj.overs_bowls)));
            if(selfNRR>=highNRR){
              attr1 = i;
            }else if(selfNRR>lowNRR){
              if(i==dataObj.runs-1){
                attr2 = i;
                var arr = [];
                arr.push({"message":"You should restrict " + againstObj.team +" between " +attr1 + " and " + attr2+ " runs to reach postion " +dataObj.position+ "!!"
                        ,"SelfNRR":preNRR,"againstNRR":aggNRR
              });
                return arr
              }else{
                attr2 = i;
              } 
            }else{
              var arr = [];
              arr.push({"message":"You should restrict " + againstObj.team +" between " +attr1+ " and " + attr2 + " runs to reach postion " +dataObj.position+ "!!"
                      ,"SelfNRR":preNRR,"againstNRR":aggNRR
            });
              return arr            }
          }
        }else if(dataObj.team2!=dataObj.position && dataObj.team2!=(dataObj.position-1)){
          var lowNRR = positionObj.NRR;
          var highNRR = highObj.NRR;
          for(i=1;i<dataObj.runs;i++){
            var selfNRR =  (selftotalruns/selfovers) - ((selfObj.Run_Against+i)/(selfObj.Overs_Bowl+20));
            if(selfNRR>=highNRR){
              attr1 = i;
            }else if(selfNRR>lowNRR){
              if(i==dataObj.runs-1){
                attr2 = i;
                return [{"message":"You should restrict " + againstObj.team +" between " +attr1+ " and " + attr2 + " runs to reach postion " +dataObj.position+ "!!"}]
              }else{
                attr2 = i;
              } 
            }else{
              return [{"message":"You should restrict " + againstObj.team +" between " +attr1+ " and " + attr2 + " runs to reach postion " +dataObj.position+ "!!"}]
            }
          }
        }
      }
    }else{
      if(highObj.won*2==((selfObj.won*2)+2)){
        var againsttotalruns = Number(againstObj.Run_Scored) + Number(dataObj.runs);
        var againstovers =  Number(againstObj.Overs) + Number(dataObj.overs_bowls);
        var attr1 = 0;
        var attr2 = 0;
        ////////////////////////////////////////////////////////////////////////
        if(dataObj.position==dataObj.team2){
          var highNRR = highObj.NRR;
          var preNRR =0;
          var aggNRR = 0;
          for(i=1;i<121;i++){
            preNRR = selfNRR;
            aggNRR = againstNRR;
            var selfNRR =  ((Number(selfObj.Run_Scored)+Number(dataObj.runs) + 1)/(selfObj.Overs+(i/6))) - ((Number(selfObj.Run_Against)+Number(dataObj.runs))/(Number(selfObj.Overs_Bowl)+Number(dataObj.overs_bowls)));
            var againstNRR = ((Number(againstObj.Run_Scored)+Number(dataObj.runs))/(Number(againstObj.Overs) + Number(dataObj.overs_bowls))) - ((Number(againstObj.Run_Against)+Number(dataObj.runs)+1)/(Number(againstObj.Overs_Bowl)+(i/6)));
            if(selfNRR>=highNRR){
              if(i==120){
                attr1 = i;
                var arr = [];
                arr.push({"message":"You will reach position " +(dataObj.position) + "by Winning match with any margin !!"
                        ,"SelfNRR":preNRR,"againstNRR":aggNRR
              });
                return arr 
              }else{
                attr1 = i;
              }
            }else if(selfNRR>againstNRR){
              if(i==120){
                attr2 = i;
                var arr = [];
                arr.push({"message":"You should chase the target Between " + Math.floor(attr1/6) +"."+attr1%6 +" and " + Math.floor(attr2/6) +"."+attr2%6 + " Overs to reach postion " +dataObj.position+ "!!"
                        ,"SelfNRR":preNRR,"againstNRR":aggNRR
              });
                return arr
              }else{
                attr2 = i;
              } 
            }else{
              var arr = [];
              arr.push({"message":"You should chase the target Between " + Math.floor(attr1/6) +"."+attr1%6  +" and " + Math.floor(attr2/6) +"."+attr2%6 + " Overs to reach postion " +dataObj.position+ "!!"
              ,"SelfNRR":preNRR,"againstNRR":aggNRR
              });
              return arr
            }
          }
          //////////////////////////////////////////////////////////////////////
        }else if(dataObj.team2==(dataObj.position-1)){
          var lowNRR = positionObj.NRR
          var selfNRR=0;
          var highNRR =0;
          for(i=1;i<121;i++){
            var preNRR = selfNRR;
            var aggNRR = highNRR;
            selfNRR =  ((Number(selfObj.Run_Scored)+Number(dataObj.runs) + 1)/(selfObj.Overs+(i/6))) - ((Number(selfObj.Run_Against)+Number(dataObj.runs))/(Number(selfObj.Overs_Bowl)+Number(dataObj.overs_bowls)));
            highNRR = ((Number(highObj.Run_Scored)+Number(dataObj.runs))/(Number(highObj.Overs) + Number(dataObj.overs_bowls))) - ((Number(highObj.Run_Against)+Number(dataObj.runs)+1)/(Number(highObj.Overs_Bowl)+(i/6)));
            if(selfNRR>=highNRR){
              if(i==120){
                attr1 = i;
                var arr = [];
              arr.push({"message":"You will reach position " +(dataObj.position) + "by Winning match with any margin !!"
                      ,"SelfNRR":preNRR,"againstNRR":aggNRR
                    });
                return arr
              }else{
                attr1 = i;
              }
            }else if(selfNRR>lowNRR){
              if(i==120){
                attr2 = i;
                var arr = [];
                arr.push({"message":"You should chase the target Between " + Math.floor(attr1/6) +"."+attr1%6  +" and " + Math.floor(attr2/6) +"."+attr2%6 + " Overs to reach postion " +dataObj.position+ "!!"
                        ,"SelfNRR":preNRR,"againstNRR":aggNRR
                      });
                  return arr
              }else{
                attr2 = i;
              } 
            }else{
              var arr = [];
              arr.push({"message":"You should chase the target Between " + Math.floor(attr1/6) +"."+attr1%6  +" and " + Math.floor(attr2/6)+"."+attr2%6 + " Overs to reach postion " +dataObj.position+ "!!"
                      ,"SelfNRR":preNRR,"againstNRR":aggNRR
                    });
                return arr
            }
          }
        }else if(dataObj.team2!=dataObj.position && dataObj.team2!=(dataObj.position-1)){
          var lowNRR = positionObj.NRR;
          var highNRR = highObj.NRR;
          for(i=1;i<dataObj.runs;i++){
            var selfNRR =  ((Number(selfObj.Run_Scored)+Number(dataObj.runs) + 1)/(selfObj.Overs+(i/6))) - ((Number(selfObj.Run_Against)+Number(dataObj.runs))/(Number(selfObj.Overs_Bowl)+Number(dataObj.overs_bowls)));
            if(selfNRR>=highNRR){
              if(i==120){
                attr1 = i;
                arr=[];
                arr.push({"message": "You will reach position " +(dataObj.position) + "by Winning match with any margin !!"});
                return arr
              }else{
                attr1 = i;
              }
            }else if(selfNRR>againstNRR){
              if(i==120){
                attr2 = i;
                arr=[];
                arr.push({"message": "You should chase the target Between " + Math.floor(attr1/6) +"."+attr1%6  +" and " + Math.floor(attr2/6) +"."+attr2%6 + " Overs to reach postion " +dataObj.position+ "!!","SelfNRR":selfNRR});
                return arr
              }else{
                attr2 = i;
              } 
            }else{
              arr=[];
              arr.push({"message": "You should chase the target Between " + Math.floor(attr1/6) +"."+attr1%6  +" and " + Math.floor(attr2/6)+"."+attr2%6 + " Overs to reach postion " +dataObj.position+ "!!","SelfNRR":selfNRR});
              return arr
              }
          }
        }
      }
    }
  }
}

app.get('/mainJS', function(req, res, next) {
  res.sendFile(path.join(__dirname,'./Client/js/index.js'))
});

app.use(express.static(__dirname + '/public/images'));


app.listen(port);
console.log('Server started at http://localhost:' + port);
