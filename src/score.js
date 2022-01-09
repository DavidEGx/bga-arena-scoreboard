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
  // Limit max number of request sent to BGA.
  const MAX_REQUESTS = 300; // 300 requests = check 3000 players scores

  const playersToKeep = prompt('Players to keep?').split(',');
  run(playersToKeep);

  /**
   * Do the work.
   * Load players, remove players not desired and repeat.
   */
  async function run(playersToKeep) {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await loadMorePlayers();
      removePlayers(playersToKeep);

      if (playersToKeep.length === document.querySelectorAll('#mainRanking .player_in_list').length) {
        // Got all the required players, no need to keep querying.
        return;
      }
      await new Promise(done => setTimeout(() => done(), REQUEST_INTERVAL));
    }
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
   * Remove all players from the scoreboard
   * except the ones received as parameter.
   */
  function removePlayers(playersToKeep) {
    playersToKeep = playersToKeep .map(p => p.toLowerCase());

    for (const player of document.querySelectorAll('#mainRanking .player_in_list')) {
      const name = player.querySelector('a.playername').innerText.toLowerCase();
      if (!playersToKeep.includes(name)) {
        player.remove();
      }
    }
  }

})();
