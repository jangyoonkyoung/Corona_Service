$.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    prevText: '이전 달',
    nextText: '다음 달',
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
    showMonthAfterYear: true,
    yearSuffix: '년'
});

$(function() {
    var coronaWeekChart = new Chart($("#accDecideChart"),{
        type:"line",
        options:{
            responsive:false
        },
        data:{
            labels:null,
            datasets:[{
                label:"코로나 누적 확진",
                data:null,
                backgroundColor:[
                    'rgba(30,30,255,0.7)'
                ]
            }]
        }
    })

    var vaccineWeeksChart = new Chart($("#accVaccineChart"),{
        type:"line",
        options:{
            responsive:false
        },
        data:{
            labels:null,
            datasets:[{
                label:"백신1차접종/백신2차접종",
                data:null,
                backgroundColor:[
                    'rgba(30,30,255,0.7)','rgba(255,30,255,0.7)'
                ]
            }]
        }
    })

    $("#date").datepicker();
    $("#date").datepicker("setDate", new Date());

    $("#date").change(function(){
        let region = $("#region_select").find("option:selected").val();
        let date = $("#date").val();
        getCoronaSidoInfo(region, date);
        getCoronaVaccineInfo(region, date);
    })

    $("#region_select").change(function(){
        let region = $("#region_select").find("option:selected").val();
        let date = $("#date").val();
        getCoronaSidoInfo(region, date);
        getCoronaVaccineInfo(region, date);
    });

    getCoronaSidoInfo("서울")
    getCoronaVaccineInfo("서울")

    function getCoronaSidoInfo(sido, date){
        let url = "http://localhost:8077/api/regional?region="+sido;
        if(date != undefined && date != null && date != '') {
            url += "&date="+date 
        }
        $.ajax({
            type:"get",
            url:url,
            success:function(r) {
                console.log(r);
                if(r.coronaWeeksList != null){
                    let coronaWeeksLabel = new Array();
                    let coronaWeeksData = new Array();
                    for(let i=0; i<r.coronaWeeksList.length; i++){
                        coronaWeeksLabel.push(r.coronaWeeksList[i].date);
                        coronaWeeksData.push(r.coronaWeeksList[i].defCnt);
                    }
                    coronaWeekChart.data.datasets = new Array(); //데이터 셋 초기화
                    coronaWeekChart.data.labels = coronaWeeksLabel //레이블 교체
                    //데이터 셋 추가
                    coronaWeekChart.data.datasets.push({
                        label:'코로나 누적 확진',data: coronaWeeksData,
                        backgroundColor:['rgba(255,0,0,0.7)']
                    });
                    //차트 업데이트
                    coronaWeekChart.update();

                    if(r.vaccineWeeksList != null){
                        let vaccineWeeksLabel = new Array();
                        let firvaccineWeeksData = new Array();
                        let seovaccineWeeksData = new Array();
                        for(let i=0; i<r.vaccineWeeksList.length; i++){
                            vaccineWeeksLabel.push(r.vaccineWeeksList[i].date);
                            firvaccineWeeksData.push(r.vaccineWeeksList[i].accFirstCnt);
                            seovaccineWeeksData.push(r.vaccineWeeksList[i].accSecondCnt);
                        }
                        vaccineWeeksChart.data.datasets = new Array(); //데이터 셋 초기화
                        vaccineWeeksChart.data.labels = vaccineWeeksLabel //레이블 교체
                        //데이터 셋 추가
                        vaccineWeeksChart.data.datasets.push({
                            label:'1차 접종',data: firvaccineWeeksData,
                            backgroundColor:['#99CCFF']
                        });
                        vaccineWeeksChart.data.datasets.push({
                            label:'2차 접종',data: seovaccineWeeksData,
                            backgroundColor:['rgb(30, 30, 255, 0.7)']
                        });
                        //차트 업데이트
                        vaccineWeeksChart.update();
    
                        
                        // var coronaWeekChart = new Chart($("#accDecideChart"),{
                        //     type:"line",
                        //     options:{
                        //         responsive:false
                        //     },
                        //     data:{
                        //         labels:coronaWeeksLabel,
                        //         datasets:[{
                        //             label:"코로나 누적 확진",
                        //             data:coronaWeeksData,
                        //             backgroundColor:[
                        //                 'rgba(30,30,255,0.7)'
                        //             ]
                        //         }]
                        //     }
                        // })
                    }

                
                }
                if(r.dangerAge==null){
                    $("#dangerAge").html("-")
                }
                else{
                $("#dangerAge").html(r.dangerAge+"대")
                }
                if(r.data == null) {
                    $("#accDecideCnt").html("-");
                    $("#newDecideCnt").html("-");
                    $("#isolateCnt").html("-");
                    $("#clearIsolateCnt").html("-");
                    $("#covidDanger span").css("display", "none");
                    $("#covidDanger span").eq(0).css("display", "inline").css("color", "#66ff99");
                }

                $("#accDecideCnt").html(r.data.defCnt);
                $("#newDecideCnt").html(r.data.incDec);
                $("#isolateCnt").html(r.data.isolIngCnt);
                $("#clearIsolateCnt").html(r.data.isolClearCnt);
                $("#covidDanger span").css("display", "none");

                let danger = r.data.incDec + r.data.diff;
                if(danger >= 200) {
                    $("#covidDanger span").eq(3).css("display", "inline").css("color", "#FF0000");
                }
                else if(danger >= 100) {
                    $("#covidDanger span").eq(2).css("display", "inline").css("color", "#FF6600");
                }
                else if(danger >= 10) {
                    $("#covidDanger span").eq(1).css("display", "inline").css("color", "#FFCC00");
                }
                else {
                    $("#covidDanger span").eq(0).css("display", "inline").css("color", "#00CC00");
                }
            }
        })
    }
    function getCoronaVaccineInfo(sido, date) {
        let url = "/api/regional/vaccine?region="+sido;
        if(date != undefined && date != null && date != '') {
            url += "&date="+date 
        }

        $.ajax({
            type:"get",
            url: url,
            success:function(r) {
                console.log(r);
                if(r.status == false) {
                    $("#vaccineFirstCnt").html("-");
                    $("#vaccineSecondCnt").html("-");
                    return;
                }
                $("#vaccineFirstCnt").html(r.formattedFirstCnt);
                $("#vaccineSecondCnt").html(r.formattedSecondCnt);
            }
        })
    }
})