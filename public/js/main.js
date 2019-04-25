// when select league, populate the 'home teams' and 'away teams' divs with the teams from that league
let league, homeClub, awayClub;
let clubs = new Array();
let simSpeed = 100;

$(document).ready(function(){

	$('.league').click(function(e) {

		if ($(this).hasClass('selected')){
			console.log("League already selected");
			return -1;
		}
		
		$('#leagues div').removeClass('selected');
		$(this).addClass("selected");
		resetScoreboard();

		const id = this.id;
		
		switch(id){
			case 'premier-league':
				league = "Premier League";
				$('#scoreboard').attr('class', 'scoreboard-eng');
				break;
			case 'serie-a':
				league = "Serie A";
				$('#scoreboard').attr('class', 'scoreboard-ita');
				break;
			case 'la-liga':
				league = "La Liga";
				$('#scoreboard').attr('class', 'scoreboard-esp');
				break;
			case 'bundesliga':
				league = "Bundesliga";
				$('#scoreboard').attr('class', 'scoreboard-ger');
				break;
			case 'primeira-liga':
				league="Primeira Liga";
				$('#scoreboard').attr('class', 'scoreboard-por');
				break;
			case 'eredivisie':
				league="Eredivisie";
				$('#scoreboard').attr('class', 'scoreboard-ned');
				break;
			case 'ligue1':
				league="Ligue 1";
				$('#scoreboard').attr('class', 'scoreboard-fra');
				break;
			default:
				console.log('no league');
		}

		// get clubs for the chosen league, and alphabetically add them to the team divs
		$.getJSON('./data/data.json', function(json){
			clubs = (json[league].clubs);
		
			clubs.sort(function(a,b) {
				const aName = a.name;
				const bName = b.name;
				return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
			});

			// clear the lists of teams; then for each club in the chosen league, add it to the home and away teams divs
			$('#home-team').html('<h1>HOME TEAM</h1>');
			$('#away-team').html('<h1>AWAY TEAM</h1>');
			let html = "";

			for (let i = 0; i < clubs.length; i++){
				const name = clubs[i].name;
				const badgeSrc = clubs[i].badge;
				html += '<div class="team"><img src="'+badgeSrc+'" />'+name+'</div>'
			}

			$('#home-team').append(html);
			$('#away-team').append(html);

		});

		
	});

	// set home and away club variable to the chosen teams, and update the scoreboard with the correct badges
	$('#home-team').on('click', 'div', function(e) {
		resetScoreboard('home');
		const name = $(this).text();
		$('#home-team div').removeClass('selected');
		$(this).addClass('selected');

		// search through clubs array to get badge, and add it to the scoreboard
		for (let i = 0; i < clubs.length; i++){
			if (name === clubs[i].name){
				$('#home').html('<img src='+clubs[i].badge+' />');
				homeClub = clubs[i];
			}
		}

	});
	
	$('#away-team').on('click', 'div', function(e) {
		resetScoreboard('away');
		const name = $(this).text();
		$('#away-team div').removeClass('selected');
		$(this).addClass('selected');

		// search through clubs array to get badge, and add it to the scoreboard
		for (let i = 0; i < clubs.length; i++){
			if (name === clubs[i].name){
				$('#away').html('<img src='+clubs[i].badge+' />');
				awayClub = clubs[i];
			}
		}

	});

	$("#controls").find("button").click(function () {
	        
			if (!homeClub || !awayClub){
				alert("Select 2 teams");
				return -1;
			}

			switch(this.id){
				case 'quick-sim':
					simSpeed = 40;
					simulateMatch();
	        		break;
	        	case 'slow-sim':
	        		simSpeed = 200;
	        		simulateMatch();
	        		break;
	        	case 'instant':
					instantResult();	
					break;
				default:
					return false;
			}
	        
	});


	// prevent clicking function (during simulation, shouldn't be able to click on clubs or leagues or sim buttons)
	$(".noclick").click(function(e) {
		e.preventDefault();
    });

});



// when a new league is selected, the scoreboard should reset back to default
function resetScoreboard(team = 'both') {

	if (team == 'both'){
		$('#scoreboard').html('<div id="home"></div><div id="score"><span id="home-score"></span>-<span id="away-score"></span></div><div id="away"></div>');
		homeClub = null;
		awayClub = null;	
	} else if (team == 'home') {
		$('#home').html('');
		$('#score').html('<span id="home-score"></span> - <span id="away-score"></span>');
	} else if (team == 'away') {
		$('#away').html('');
		$('#score').html('<span id="home-score"></span> - <span id="away-score"></span>');
	}
	
}

// instantly generate a result and display it in the scoreboard
instantResult = () => {
	const score = matchSimulation();

	if ($('#sim-control').css('display') == 'none'){
		$('#sim-control').css('display', 'flex');
		$('#scoreboard').css("margin-top", 10);
		$('.navbar').css("margin-bottom", 0);
	}

	$('#minutes').text("FT");
	$('#home-score').text(score[0]);
    $('#away-score').text(score[1]);
}


// view minutes count up from 0-90 and see 'live' score in the scoreboard
simulateMatch = () => {
	const score = matchSimulation();
	
	// randomly choose in which minute the goals are scored;
	const homeGoals = new Array();
	const awayGoals = new Array();

	for (let i = 0; i < score[0]; i++){
		let minute = Math.floor(Math.random() * 90);

		if (homeGoals.includes(minute)){
			i--;	
		} else {
			homeGoals.push(minute);
		}
	}
	for (let i = 0; i < score[1]; i++){
		let minute = Math.floor(Math.random() * 90) + 1;

		if (awayGoals.includes(minute)){
			i--;	
		} else {
			awayGoals.push(minute);
		}
	}
	homeGoals.sort();
	awayGoals.sort();

	if ($('#sim-control').css('display') == 'none'){
		$('#sim-control').css('display', 'flex');
		$('#scoreboard').css("margin-top", 10);
		$('.navbar').css("margin-bottom", 0);
	}
	
	let minutes = 0;
	$('#minutes').text(minutes + "'");
	$('#home-score').text('0');
	$('#away-score').text('0');
	

	const simMatch = setInterval(function(){
		$('#instant').attr('disabled', true);
		$('#quick-sim').attr('disabled', true);
		$('#slow-sim').attr('disabled', true);
		$('#selection').css('display', 'none');
		

		minutes++;	
		$('#minutes').text(minutes + "'");

		if (minutes >= 90){
			$('#minutes').text("FT");
			$('#instant').attr('disabled', false);
			$('#quick-sim').attr('disabled', false);
			$('#slow-sim').attr('disabled', false);
			$('#selection').css('display', 'block');
			clearInterval(simMatch);
		}
		
		if (homeGoals.includes(minutes)){
			$('#home-score').text(parseInt($('#home-score').text()) + 1);
		}

		if (awayGoals.includes(minutes)){
			$('#away-score').text(parseInt($('#away-score').text()) + 1);
		}


		
	}, simSpeed);
	
}




// MATCH SIMULATION
matchSimulation = () => {
	const homeStats = homeClub.stats;
	const awayStats = awayClub.stats;

	let totalHomeGoals = 0
	let totalAwayGoals = 0;

	for (let i = 0; i < clubs.length; i++){
		totalHomeGoals += clubs[i].stats.homeScored;
		totalAwayGoals += clubs[i].stats.awayScored;
	}

    const homeAttack = (homeClub.stats.homeScored / (clubs.length-1)) / (totalHomeGoals / (clubs.length * (clubs.length - 1)));
    const homeDefence = (homeClub.stats.homeConceded / (clubs.length-1)) / (totalAwayGoals / (clubs.length * (clubs.length - 1)));
    const awayAttack = (awayClub.stats.awayScored / (clubs.length-1)) / (totalAwayGoals / (clubs.length * (clubs.length - 1)));
    const awayDefence = (awayClub.stats.awayConceded / (clubs.length-1)) / (totalHomeGoals / (clubs.length * (clubs.length - 1)));

    const homeStrength = homeAttack * awayDefence * (totalHomeGoals / (clubs.length * (clubs.length - 1)));
    const awayStrength = awayAttack * homeDefence * (totalAwayGoals / (clubs.length * (clubs.length - 1)));

    const homeGoals = poisson(homeStrength);
    const awayGoals = poisson(awayStrength);

    return [homeGoals, awayGoals];
}

function poisson(lambda){

    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
        k = k + 1;
        const u = Math.random();
        p = p * u;
    } 
    while (p > L);

    return k-1;
}

