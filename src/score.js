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
  const REQUEST_INTERVAL = 700;

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

    // Labels
    countryLbl.innerText  = 'Country filter:';
    userLbl.innerText     = 'User filter:';
    limitsLbl.innerText   = 'Limits:';
    progressLbl.innerText = 'Running...';
    progressLbl.id = 'progressLbl';

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
      const text = userList.value;
      const commaValues = text.split(',');
      const semicolonValues = text.split(';');
      const newlineValues = text.split('\n');
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

      const playersSoFar = document.querySelectorAll('#mainRanking .player_in_list');
      if (playersToKeep.length > 0 && playersToKeep.length === playersSoFar.length) {
        // Got all the required players, no need to keep querying.
        break;
      }

      if (playersSoFar.length >= limitU) {
        // Reached limit of max number of players required.
        let i = 0;
        for (const player of document.querySelectorAll('#mainRanking .player_in_list')) {
          if (i >= limitU) {
            player.remove();
          }
          i++;
        }
        break;
      }

      await new Promise(done => setTimeout(() => done(), REQUEST_INTERVAL));
    }

    const progressLbl = document.getElementById('progressLbl');
    progressLbl.innerText = 'Done!';
    progressLbl.style.color = 'green';
  }

  /**
   * Load more players from the ranking
   */
  async function loadMorePlayers() {
    // Just click the button and wait.
    // Not the smartest way but works.
    document.querySelector('#seemoreRanking').click();
    await new Promise(done => setTimeout(() => done(), REQUEST_INTERVAL));
  }

  /**
   * Remove all players from the scoreboard except the ones
   * than belong to the country received as parameter and are
   * inside the playersToKeep array.
   */
  function removePlayers(country, playersToKeep) {
    playersToKeep = playersToKeep.map(p => p.toLowerCase());

    for (const player of document.querySelectorAll('#mainRanking .player_in_list')) {
      const name = player.querySelector('a.playername').innerText.toLowerCase();

      if (country && country != player.querySelector('.flag').style.backgroundPosition) {
        player.remove();
      }

      if (playersToKeep.length > 0 && !playersToKeep.includes(name)) {
        player.remove();
      }
    }
  }

  function COUNTRIES() { return {
    '': 'Any country',
    '-32px -88px': 'Brazil',
    '-96px -77px': 'Spain',
    '-112px -88px': 'United Kingdom'
  };
  }

})();
