/**
 * BGA Arena Scoreboard
 *
 * Script to filter BGA Arena scoreboard so you can get
 * the score of a predefined list of players.
 *
 * Usage:
 *  1. Copy and paste this code to the developer console
 *     (or put it as a bookmarklet https://caiorss.github.io/bookmarklet-maker/)
 *  2. Introduce a list of players separated by spaces.
 *  3. Click Ok and wait until the scoreboard loads.
 */

(function() {
  'use strict';

  // DO NOT use a very small interval, don't want to abuse BGA servers.
  const REQUEST_INTERVAL = 300;

  createUi();

  /**
   * Adds text area so user can paste user's list
   */
  function createUi() {
    const ui = document.createElement('div');
    const countryLbl  = document.createElement('p');
    const countrySel  = document.createElement('select');
    const userLbl     = document.createElement('p');
    const userList    = document.createElement('textArea');
    const limitsLbl   = document.createElement('p');
    const limitUInput = document.createElement('input');
    const limitRInput = document.createElement('input');
    const progressLbl = document.createElement('p');
    const button      = document.createElement('a');

    countrySel.id  = 'sbCountrySelector';
    userList.id    = 'sbUserList';
    progressLbl.id = 'sbProgressLbl';

    // Labels
    countryLbl.innerText  = 'Country filter:';
    userLbl.innerText     = 'User filter:';
    limitsLbl.innerText   = 'Limits:';
    progressLbl.innerText = 'Running...';

    //Create and append the options
    for (const [key, value] of Object.entries(COUNTRIES())) {
      const option = document.createElement('option');
      option.value = key;
      option.text = value;
      countrySel.appendChild(option);
    }

    // Configure user list
    userList.style.display = 'block';
    userList.style.width   = '100%';
    userList.style.height  = '40%';

    // Configure limits
    limitUInput.type  = 'number';
    limitUInput.value = 20;
    limitRInput.type  = 'number';
    limitRInput.value = 1000;

    // Add elements to main ui element
    ui.appendChild(countryLbl);
    ui.appendChild(countrySel);
    ui.appendChild(userLbl);
    ui.appendChild(userList);
    ui.appendChild(limitsLbl);
    ui.appendChild(limitUInput);
    ui.appendChild(limitRInput);
    ui.appendChild(button);

    // Configuration of main ui element
    ui.style.position = 'fixed';
    ui.style.right = '0';
    ui.style.top = '0';
    ui.style.margin = '1em 1em';
    ui.style.width = '400px';
    ui.style.height = '300px';
    ui.style.padding = '1.5em';
    ui.style.backgroundColor = '#eeefef';
    ui.style.zIndex = 99999;
    ui.style.border = '2px solid black';
    ui.style.boxShadow = '7px 7px #444';

    button.classList = 'bgabutton bgabutton_blue';
    button.innerText = 'Run';
    button.onclick   = function() {
      const players = parsePlayers(userList.value);
      run(countrySel.value, players, parseInt(limitUInput.value), parseInt(limitRInput.value));

      button.style.display = 'none';
      ui.appendChild(progressLbl);
    };

    document.body.appendChild(ui);
  }

  /**
   * Do the work.
   * Load players, remove players not desired and repeat.
   */
  async function run(country, playersToKeep, limitU, limitR) {
    const MAX_REQUESTS = limitR / 10;
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await loadMorePlayers();
      removePlayers(country, playersToKeep);

      const playersSoFar = getVisiblePlayers();
      if (playersToKeep.length > 0 && playersToKeep.length === playersSoFar.length) {
        // Got all the required players, no need to keep querying.
        break;
      }

      if (playersSoFar.length >= limitU) {
        // Reached limit of max number of players required.
        let i = 0;
        for (const player of getVisiblePlayers()) {
          if (i >= limitU) {
            player.classList.add('hidden');
          }
          i++;
        }
        break;
      }

      await new Promise(done => setTimeout(() => done(), REQUEST_INTERVAL));
    }

    const progressLbl = document.getElementById('sbProgressLbl');
    const userList    = document.getElementById('sbUserList');
    const countrySel = document.getElementById('sbCountrySelector');
    progressLbl.innerText = 'Done!';
    progressLbl.style.color = 'green';

    countrySel.addEventListener('change', function () {
      resetList();
      const players = parsePlayers(userList.value);
      removePlayers(countrySel.value, players);
    });
    userList.addEventListener('change', function () {
      resetList();
      const players = parsePlayers(userList.value);
      removePlayers(countrySel.value, players);
    });
  }

  /**
   * Load more players from the ranking
   */
  async function loadMorePlayers() {
    // Just click the button and wait.
    // Not the smartest way but works.
    const button = document.querySelector('#seemoreRanking') || document.querySelector('#seemore') || document.querySelector('#seemore_rankings') || document.querySelector('#prestige_see_more');
    button.click();
    await new Promise(done => setTimeout(() => done(), REQUEST_INTERVAL));
  }

  /**
   * Return list of players
   */
  function getPlayers() {
    if (document.getElementById('mainRanking')) {
      return document.querySelectorAll('#mainRanking .player_in_list');
    }
    else {
      return document.querySelectorAll('.gameranking .player_in_list');
    }
  }

  /**
   * Return list of visible players
   */
  function getVisiblePlayers() {
    if (document.getElementById('mainRanking')) {
      return document.querySelectorAll('#mainRanking .player_in_list:not(.hidden)');
    }
    else {
      return document.querySelectorAll('.gameranking .player_in_list:not(.hidden)');
    }
  }

  /**
   * Parse players
   */
  function parsePlayers(playersStr) {
    const commaValues = playersStr.split(',');
    const semicolonValues = playersStr.split(';');
    const newlineValues = playersStr.split('\n');
    const usersFound = Math.max(commaValues.length, semicolonValues.length, newlineValues.length);

    let players;
    if (commaValues.length === usersFound) {
      players = commaValues;
    }
    else if (semicolonValues.length == usersFound) {
      players = semicolonValues;
    }
    else if (newlineValues.length == usersFound) {
      players = newlineValues;
    }

    players = players.filter(x => x);
    return players;
  }

  /**
   * Remove all players from the scoreboard except the ones
   * than belong to the country received as parameter and are
   * inside the playersToKeep array.
   */
  function removePlayers(country, playersToKeep) {
    playersToKeep = playersToKeep.map(p => p.toLowerCase());

    for (const player of getVisiblePlayers()) {
      const name = player.querySelector('a.playername').innerText.toLowerCase();

      if (country && country != player.querySelector('.flag').style.backgroundPosition) {
        player.classList.add('hidden');
      }

      if (playersToKeep.length > 0 && !playersToKeep.includes(name)) {
        player.classList.add('hidden');
      }
    }
  }

  /**
   * Display all players again
   */
  function resetList() {
    Array.from(getPlayers()).forEach((el) => el.classList.remove('hidden'));
  }

  function COUNTRIES() {
    // IDs of the countries here are just the offset in the background image.
    // It'd be nice to use country ids instead... Probably that would require
    // to change the `document.querySelector('#seemoreRanking').click()` above
    // and use an ajax call to `getRanking.html` instead.
    return {
      '': 'Any country',
      '-0px -55px': 'Albania',
      '-0px -99px': 'Argentina',
      '-16px -22px': 'Australia',
      '-48px -33px': 'Belarus',
      '-16px -99px': 'Belgium',
      '-32px -88px': 'Brazil',
      '-48px -55px': 'Canada',
      '-64px -44px': 'Chile',
      '-144px -88px': 'Croatia',
      '-64px -77px': 'Colombia',
      '-80px -44px': 'Czech Republic',
      '-80px -99px': 'Dominican Republic',
      '-112px -66px': 'France',
      '-112px -11px': 'Finland',
      '-128px -0px': 'Georgia',
      '-80px -55px': 'Germany',
      '-128px -99px': 'Greece',
      '-144px -11px': 'Guatemala',
      '-144px -55px': 'Hong Kong',
      '-160px -0px': 'Hungary',
      '-160px -99px': 'Italy',
      '-160px -33px': 'Israel',
      '-176px -0px': 'Jamaica',
      '-176px -22px': 'Japan',
      '-192px -33px': 'Kazakhstan',
      '-208px -33px': 'Latvia',
      '-208px -11px' : 'Lithuania',
      '-240px -55px': 'Malaysia',
      '-224px -0px': 'Marshall Islands',
      '-240px -11px': 'Mauritius',
      '-240px -44px': 'Mexico',
      '-224px -99px': 'Montserrat',
      '-256px -33px': 'Netherlands',
      '-256px -0px': 'Norfolk Island',
      '-176px -99px': 'North Korea',
      '-256px -44px': 'Norway',
      '-272px -11px': 'Peru',
      '-272px -66px': 'Poland',
      '-288px -11px': 'Portugal',
      '-288px -66px': 'Romania',
      '-288px -88px': 'Russian Federation',
      '-304px -22px': 'Seychelles',
      '-304px -66px': 'Singapore',
      '-320px -0px': 'Slovakia',
      '-192px -0px': 'South Korea',
      '-96px -77px': 'Spain',
      '-304px -55px': 'Sweden',
      '-64px -11px': 'Switzerland',
      '-352px -44px': 'Taiwan',
      '-336px -44px': 'Thailand',
      '-336px -33px': 'Togo',
      '-352px -33px': 'Tuvalu',
      '-0px -11px': 'United Arab Emirates',
      '-112px -88px': 'United Kingdom',
      '-352px -99px': 'United States',
      '-384px -99px': 'Unknown',
      '-352px -66px': 'Ukraine',
      '-368px -22px': 'Vatican',
      '-368px -44px': 'Venezuela',
      '-368px -77px':'Viet Nam'
    };
  }

})();

