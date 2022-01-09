# 🙾  bga-arena-scoreboard
Filter ranking of players in BGA Arena

## ✨ Demo
![GIF Demo](https://raw.githubusercontent.com/DavidEGx/bga-arena-scoreboard/main/demo.gif?token=AAIB2POYM6LBERGEGLOABBK7ALHGU)

## 📦 Setup
Create a new bookmark in your browser that points to this "address":

    javascript:(function()%7B%2F**%0A%20*%20BGA%20Arena%20Scoreboard%0A%20*%0A%20*%20Script%20to%20filter%20BGA%20Arena%20scoreboard%20so%20you%20can%20get%0A%20*%20the%20score%20of%20a%20predefined%20list%20of%20players.%0A%20*%0A%20*%20Usage%3A%0A%20*%20%201.%20Copy%20and%20paste%20this%20code%20to%20the%20developer%20console%0A%20*%20%20%20%20%20(or%20put%20it%20as%20a%20bookmarklet%20https%3A%2F%2Fcaiorss.github.io%2Fbookmarklet-maker%2F)%0A%20*%20%202.%20Introduce%20a%20list%20of%20players%20separated%20by%20spaces.%0A%20*%20%203.%20Click%20Ok%20and%20wait%20until%20the%20scoreboard%20loads.%0A%20*%2F%0A%0A(function()%20%7B%0A%20%20'use%20strict'%3B%0A%0A%20%20%2F%2F%20DO%20NOT%20use%20a%20very%20small%20interval%2C%20don't%20want%20to%20abuse%20BGA%20servers.%0A%20%20const%20REQUEST_INTERVAL%20%3D%20700%3B%0A%20%20%2F%2F%20Limit%20max%20number%20of%20request%20sent%20to%20BGA.%0A%20%20const%20MAX_REQUESTS%20%3D%20300%3B%20%2F%2F%20300%20requests%20%3D%20check%203000%20players%20scores%0A%0A%20%20const%20playersToKeep%20%3D%20prompt('Players%20to%20keep%3F').split('%2C')%3B%0A%20%20run(playersToKeep)%3B%0A%0A%20%20%2F**%0A%20%20%20*%20Do%20the%20work.%0A%20%20%20*%20Load%20players%2C%20remove%20players%20not%20desired%20and%20repeat.%0A%20%20%20*%2F%0A%20%20async%20function%20run(playersToKeep)%20%7B%0A%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20MAX_REQUESTS%3B%20i%2B%2B)%20%7B%0A%20%20%20%20%20%20await%20loadMorePlayers()%3B%0A%20%20%20%20%20%20removePlayers(playersToKeep)%3B%0A%0A%20%20%20%20%20%20if%20(playersToKeep.length%20%3D%3D%3D%20document.querySelectorAll('%23mainRanking%20.player_in_list').length)%20%7B%0A%20%20%20%20%20%20%20%20%2F%2F%20Got%20all%20the%20required%20players%2C%20no%20need%20to%20keep%20querying.%0A%20%20%20%20%20%20%20%20return%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20await%20new%20Promise(done%20%3D%3E%20setTimeout(()%20%3D%3E%20done()%2C%20REQUEST_INTERVAL))%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Load%20more%20players%20from%20the%20ranking%0A%20%20%20*%2F%0A%20%20async%20function%20loadMorePlayers()%20%7B%0A%20%20%20%20%2F%2F%20Just%20click%20the%20button%20and%20wait.%0A%20%20%20%20%2F%2F%20Not%20the%20smartest%20way%20but%20works.%0A%20%20%20%20document.querySelector('%23seemoreRanking').click()%3B%0A%20%20%20%20await%20new%20Promise(done%20%3D%3E%20setTimeout(()%20%3D%3E%20done()%2C%20REQUEST_INTERVAL))%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Remove%20all%20players%20from%20the%20scoreboard%0A%20%20%20*%20except%20the%20ones%20received%20as%20parameter.%0A%20%20%20*%2F%0A%20%20function%20removePlayers(playersToKeep)%20%7B%0A%20%20%20%20playersToKeep%20%3D%20playersToKeep%20.map(p%20%3D%3E%20p.toLowerCase())%3B%0A%0A%20%20%20%20for%20(const%20player%20of%20document.querySelectorAll('%23mainRanking%20.player_in_list'))%20%7B%0A%20%20%20%20%20%20const%20name%20%3D%20player.querySelector('a.playername').innerText.toLowerCase()%3B%0A%20%20%20%20%20%20if%20(!playersToKeep.includes(name))%20%7B%0A%20%20%20%20%20%20%20%20player.remove()%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%0A%7D)()%3B%7D)()%3B

## 🚀 Usage
1. Go to the raking page for a given game and season (for example: https://boardgamearena.com/halloffame?game=1&season=7)
2. Click on the bookmark you created during setup.
3. Paste a list of players separated by commas.
4. Click ok and wait until the list is complete.

## 📜 License
[GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html)
