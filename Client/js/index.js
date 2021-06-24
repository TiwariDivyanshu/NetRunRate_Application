
var teamsArr = [];
$(document).ready(function(){
    $.ajax({
        method: "GET",
        url: 'http://localhost:8080/teams',
        headers: {
            'Content-Type': 'application/json'
        },
        success : function(teamsData){
            if(teamsData!=undefined && teamsData.result!=undefined && teamsData.result.length>0){
                teamsArr = teamsData.result;
                generatePointsTable(teamsData.result);
            }
        }
    })
});

function generatePointsTable(teamsData){
    var div = "";
    div += '<div class="side-nav col-md-4 text-right">';
        div += '<button type="button" class="btn" data-toggle="modal" data-target="#calculateModal" ><i class="far fa-hand-point-left"></i> Calculate NRR</button>';
    div += '</div>';
    div += '<div id="pointsTableDiv" class="table-responsive col-md-8">';
        div += '<table class="table table-dark  table-striped" id="PointsTable">';
            div += '<thead class="thead-light">';
                div += '<tr>';
                    div += '<th>No.</th>';
                    div += '<th>Teams</th>';
                    div += '<th>Matches</th>';
                    div += '<th>Won</th>';
                    div += '<th>Lost</th>';
                    div += '<th>NRR</th>';
                    div += '<th>For</th>';
                    div += '<th>Against</th>';
                    div += '<th>Points</th>';
                div += '</tr>';
            div += '</thead>';
            div += '<tbody>';
            $.each(teamsData,function(i,item){
                div += '<tr id='+item.id+' >';
                    div += '<td class="pos">'+item.id+'</td>';
                    div += '<td class = "team">'+item.team+'</td>';
                    div += '<td class = "match">'+item.matches+'</td>';
                    div += '<td class = "won">'+item.won+'</td>'; 
                    div += '<td class = "lose">'+(item.matches - item.won)+'</td>';
                    div += '<td class="text-bold nrr">'+item.NRR+'</td>';
                    div += '<td><span class="green-text">'+item.Run_Scored+'</span> / <span class="red-text">'+item.Overs+'</span></td>';
                    div += '<td><span class="red-text">'+item.Run_Against+'</span> / <span class="green-text">'+item.Overs_Bowl+'</span></td>';
                    div += '<td class="text-bold point">'+(item.won*2)+'</td>';
                div += '</tr>';
            });
            div += '</tbody>';
        div += '</table>';
    div += '</div>';
    $('#pointsTblMainDiv').append(div);

    div="";
    div += '<form>';
    div += '<div class="form-group col-md-12">';
    div += '<label class="col-md-6"for="team1">Your Team</label>';
    div += '<select class=" col-md-6" id="team1">';
    $.each(teamsData,function(i,item){
        div += '<option value = '+item.id+'>'+item.team+'</option>';
    });
    div += '</select>';
    div += '</div>';
    div += '<div class="form-group col-md-12">';
    div += '<label class="col-md-6" for="team2">Against Team</label>';
    div += '<select class=" col-md-6" id="team2">';
    $.each(teamsData,function(i,item){
        div += '<option value = '+item.id+'>'+item.team+'</option>';
    });
    div += '</select>';
    div += '</div>';
    div += '<div class="form-group col-md-12">';
    div += '<label class="col-md-6" for="position">Position to reach</label>';
    div += '<select class=" col-md-6" id="position">';
    $.each(teamsData,function(i,item){
        div += '<option value = '+(i+1)+'>'+(i+1)+' Position</option>';
    });
    div += '</select>';
    div += '</div>';
    div += '<div class="form-group col-md-12">';
    div += '<label class="col-md-6" for="innings">Innings</label>';
    div += '<select class=" col-md-6" id="innings">';
    div += '<option value = 1>1st Innings</option>';
    div += '<option value = 2>2nd Innings</option>';
    div += '</select>';
    div += '</div>';
    div += '<div class="form-group col-md-12">';
    div += '<label class="col-md-6" for="runs">Runs</label>';
    div += '<input type="number" id ="runs" class="col-md-6">'
    div += '</div>';
    div += '<div class="form-group col-md-12">';
    div += '<label class="col-md-3" for="overs">Overs</label>';
    div += '<input type="number" id = "overs" class="col-md-3" min="1" max="20" step="1" placeholder="1-20">';
    div += '<label class="col-md-3" for="bowls">Bowls</label>';
    div += '<input type="number" id = "bowls" class="col-md-3" min="1" max="6" step="1" placeholder="1-6">';
    div += '</div>';
    div += '<button type="submit" id = "SubForm" class="btn btn-primary" data-dismiss="modal" >Calculate</button>';
    div += '</form>';
    $('#submitForm').append(div);
}
$(document).on('click','#SubForm',function(e){
    CalculateNRR();
});

function CalculateNRR(){
    var team1 =  4;
    var team2 = $('#team2').val();
    var position = 3;
    var innings = $('#innings').val();
    var runs  = $('#runs').val();
    var overs_bowls = Number($('#overs').val()) + (($('#bowls').val()*10)/60);
    if(team1!=team2){
        if(runs!=""&&overs_bowls!=0){
            if(runs.includes(".")!=true&&$('#overs').val().includes(".")!=true&&$('#bowls').val().includes(".")!=true&&overs_bowls>20!=true){
                $.ajax({
                    method: "GET",
                    url: 'http://localhost:8080/calculateNRR?team1='+team1+'&team2='+team2+'&position='+position+'&innings='+innings+'&runs='+runs+'&overs_bowls='+overs_bowls,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    success : function(res){
                        if(res!=undefined){
                            var localArr = [...teamsArr];
                            if(res.result!=undefined&&res.result[0].message!=""){
                                $("#SuccessModal label").empty();
                                $("#SuccessModal label").append(res.result[0].message);
                                $("#SuccessModal").modal('toggle');
                                var b = localArr[3];
                                localArr[3] = localArr[2];
                                localArr[2] = b;
                                console.log(localArr);
                                console.log(teamsArr);
                                $('#pointsTblMainDiv').empty();
                                $('#submitForm').empty();
                                generatePointsTable(localArr);
                                $('#pointsTableDiv #4 .pos').html(3);
                                $('#pointsTableDiv #3 .pos').html(4);
                                $('#pointsTableDiv #4 .match').html(8);
                                $('#pointsTableDiv #'+team2+' .match').html(8)
                                $('#pointsTableDiv #4 .won').html(4);
                                $('#pointsTableDiv #'+team2+' .lose').html(4);
                                $('#pointsTableDiv #4 .point').html(8);
                                if(res.result[0].SelfNRR!=""&&res.result[0].SelfNRR!=undefined){
                                    $('#pointsTableDiv #4 .nrr').html(res.result[0].SelfNRR.toFixed(3));
                                }
                                if(res.result[0].SelfNRR!="" && res.result[0].SelfNRR!=undefined){
                                    $('#pointsTableDiv #'+team2+' .nrr').html(res.result[0].againstNRR.toFixed(3));
                                }
                            }
                        }
                    }
                })
            }else{
            $("#ErrorModal label").empty();
            $("#ErrorModal label").append("Please enter valid values in fields");
            $("#ErrorModal").modal('toggle');
            }    
        }else{
            $("#ErrorModal label").empty();
            $("#ErrorModal label").append("Please enter blank fields");
            $("#ErrorModal").modal('toggle');
        }
    }else{
        $("#ErrorModal label").empty();
		$("#ErrorModal label").append("Invalid choices of teams!!");
        $("#ErrorModal").modal('toggle');
    }
}