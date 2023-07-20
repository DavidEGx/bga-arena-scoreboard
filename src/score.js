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

(() => {
  'use strict';

  // DO NOT use a very small interval, don't want to abuse BGA servers.
  const REQUEST_INTERVAL = 300;

  // Flag to indicate whether to stop running
  let stopFlag = false;

  createUi();

  /**
   * Adds text area so user can paste user's list
   */
  function createUi() {
    const ui = document.createElement('div');
    const countryLbl    = document.createElement('p');
    const countrySel    = document.createElement('select');
    const userLbl       = document.createElement('p');
    const userList      = document.createElement('textArea');
    const limitsLbl     = document.createElement('p');
    const limitUInput   = document.createElement('input');
    const limitRInput   = document.createElement('input');
    const button        = document.createElement('a');
    const closeButton   = document.createElement('span');

    closeButton.innerHTML = '&#x2716;'; // Unicode cross symbol
    closeButton.style.position = 'absolute';
    closeButton.style.top = '1em';
    closeButton.style.right = '1em';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      document.body.removeChild(ui);
    };

    countrySel.id  = 'sbCountrySelector';
    userList.id    = 'sbUserList';

    // Labels
    countryLbl.innerText  = 'Country filter:';
    userLbl.innerText     = 'User filter:';
    limitsLbl.innerText   = 'Limits:';

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
    limitRInput.value = 100;

    // Add tooltips to limit inputs
    limitUInput.title = 'Maximum number of players to display';
    limitRInput.title = 'Maximum number of requests to make (each request loads 10 more players)';

    // Add elements to main ui element
    ui.appendChild(countryLbl);
    ui.appendChild(countrySel);
    ui.appendChild(userLbl);
    ui.appendChild(userList);
    ui.appendChild(limitsLbl);
    ui.appendChild(limitUInput);
    ui.appendChild(limitRInput);
    ui.appendChild(button);
    ui.appendChild(closeButton);

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
    button.onclick   = () => {
      const players = parsePlayers(userList.value);
      const limitU = parseInt(limitUInput.value);
      const limitR = parseInt(limitRInput.value);
      const country = countrySel.value;

      // Toggle button text and stop operation
      if (button.innerText === 'Stop') {
        stopFlag = true;
        return;
      }

      // Change button text to "Stop"
      stopFlag = false;
      button.innerText = 'Stop';
      button.classList = 'bgabutton bgabutton_red';

      // Start the operation
      run(country, players, limitU, limitR).then(() => {
        // Restore button text when the operation is finished
        button.innerText = 'Run';
        button.classList = 'bgabutton bgabutton_blue';
      });
    };

    document.body.appendChild(ui);
  }

  /**
   * Do the work.
   * Load players, remove players not desired and repeat.
   */
  async function run(country, playersToKeep, limitU, limitR) {
    for (let i = 0; i < limitR; i++) {
      if (stopFlag) {
        break;
      }

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

    const userList    = document.getElementById('sbUserList');
    const countrySel = document.getElementById('sbCountrySelector');

    countrySel.addEventListener('change', () => {
      resetList();
      const players = parsePlayers(userList.value);
      removePlayers(countrySel.value, players);
    });
    userList.addEventListener('change', () => {
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

      if (country && !player.querySelector('.flag').classList.contains(`flag_${country}`)) {
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
    return {
      '': 'Any country',
      'XX': 'Unknown',
      'AF': 'Afghanistan',
      'AX': 'Åland Islands',
      'AL': 'Albania',
      'DZ': 'Algeria',
      'AS': 'American Samoa',
      'AD': 'Andorra',
      'AO': 'Angola',
      'AI': 'Anguilla',
      'AQ': 'Antarctica',
      'AG': 'Antigua and Barbuda',
      'AR': 'Argentina',
      'AM': 'Armenia',
      'AW': 'Aruba',
      'AU': 'Australia',
      'AT': 'Austria',
      'AZ': 'Azerbaijan',
      'BS': 'Bahamas',
      'BH': 'Bahrain',
      'BD': 'Bangladesh',
      'BB': 'Barbados',
      'BY': 'Belarus',
      'BE': 'Belgium',
      'BZ': 'Belize',
      'BJ': 'Benin',
      'BM': 'Bermuda',
      'BT': 'Bhutan',
      'BO': 'Bolivia',
      'BQ': 'Bonaire, Sint Eustatius and Saba',
      'BA': 'Bosnia and Herzegovina',
      'BW': 'Botswana',
      'BV': 'Bouvet Island',
      'BR': 'Brazil',
      'IO': 'British Indian Ocean Territory',
      'BN': 'Brunei Darussalam',
      'BG': 'Bulgaria',
      'BF': 'Burkina Faso',
      'BI': 'Burundi',
      'CV': 'Cabo Verde',
      'KH': 'Cambodia',
      'CM': 'Cameroon',
      'CA': 'Canada',
      'KY': 'Cayman Islands',
      'CF': 'Central African Republic',
      'TD': 'Chad',
      'CL': 'Chile',
      'CN': 'China',
      'CX': 'Christmas Island',
      'CC': 'Cocos (Keeling) Islands',
      'CO': 'Colombia',
      'KM': 'Comoros',
      'CG': 'Congo',
      'CK': 'Cook Islands',
      'CR': 'Costa Rica',
      'CI': 'Côte d\'Ivoire',
      'HR': 'Croatia',
      'CU': 'Cuba',
      'CW': 'Curaçao',
      'CY': 'Cyprus',
      'CZ': 'Czechia',
      'CD': 'Democratic Republic of the Congo',
      'DK': 'Denmark',
      'DJ': 'Djibouti',
      'DM': 'Dominica',
      'DO': 'Dominican Republic',
      'EC': 'Ecuador',
      'EG': 'Egypt',
      'SV': 'El Salvador',
      'GQ': 'Equatorial Guinea',
      'ER': 'Eritrea',
      'EE': 'Estonia',
      'SZ': 'Eswatini',
      'ET': 'Ethiopia',
      'FK': 'Falkland Islands (Malvinas)',
      'FO': 'Faroe Islands',
      'FJ': 'Fiji',
      'FI': 'Finland',
      'FR': 'France',
      'GF': 'French Guiana',
      'PF': 'French Polynesia',
      'TF': 'French Southern Territories',
      'GA': 'Gabon',
      'GM': 'Gambia',
      'GE': 'Georgia',
      'DE': 'Germany',
      'GH': 'Ghana',
      'GI': 'Gibraltar',
      'GR': 'Greece',
      'GL': 'Greenland',
      'GD': 'Grenada',
      'GP': 'Guadeloupe',
      'GU': 'Guam',
      'GT': 'Guatemala',
      'GG': 'Guernsey',
      'GN': 'Guinea',
      'GW': 'Guinea-Bissau',
      'GY': 'Guyana',
      'HT': 'Haiti',
      'HM': 'Heard Island and McDonald Islands',
      'VA': 'Holy See',
      'HN': 'Honduras',
      'HK': 'Hong Kong',
      'HU': 'Hungary',
      'IS': 'Iceland',
      'IN': 'India',
      'ID': 'Indonesia',
      'IR': 'Iran',
      'IQ': 'Iraq',
      'IE': 'Ireland',
      'IM': 'Isle of Man',
      'IL': 'Israel',
      'IT': 'Italy',
      'JM': 'Jamaica',
      'JP': 'Japan',
      'JE': 'Jersey',
      'JO': 'Jordan',
      'KZ': 'Kazakhstan',
      'KE': 'Kenya',
      'KI': 'Kiribati',
      'XK': 'Kosovo',
      'KW': 'Kuwait',
      'KG': 'Kyrgyzstan',
      'LA': 'Lao People\'s Democratic Republic',
      'LV': 'Latvia',
      'LB': 'Lebanon',
      'LS': 'Lesotho',
      'LR': 'Liberia',
      'LY': 'Libya',
      'LI': 'Liechtenstein',
      'LT': 'Lithuania',
      'LU': 'Luxembourg',
      'MO': 'Macao',
      'MG': 'Madagascar',
      'MW': 'Malawi',
      'MY': 'Malaysia',
      'MV': 'Maldives',
      'ML': 'Mali',
      'MT': 'Malta',
      'MH': 'Marshall Islands',
      'MQ': 'Martinique',
      'MR': 'Mauritania',
      'MU': 'Mauritius',
      'YT': 'Mayotte',
      'MX': 'Mexico',
      'FM': 'Micronesia',
      'MD': 'Moldova',
      'MC': 'Monaco',
      'MN': 'Mongolia',
      'ME': 'Montenegro',
      'MS': 'Montserrat',
      'MA': 'Morocco',
      'MZ': 'Mozambique',
      'MM': 'Myanmar',
      'NA': 'Namibia',
      'NR': 'Nauru',
      'NP': 'Nepal',
      'NL': 'Netherlands',
      'NC': 'New Caledonia',
      'NZ': 'New Zealand',
      'NI': 'Nicaragua',
      'NE': 'Niger',
      'NG': 'Nigeria',
      'NU': 'Niue',
      'NF': 'Norfolk Island',
      'MP': 'Northern Mariana Islands',
      'KP': 'North Korea',
      'MK': 'North Macedonia',
      'NO': 'Norway',
      'OM': 'Oman',
      'PK': 'Pakistan',
      'PW': 'Palau',
      'PS': 'Palestine',
      'PA': 'Panama',
      'PG': 'Papua New Guinea',
      'PY': 'Paraguay',
      'PE': 'Peru',
      'PH': 'Philippines',
      'PN': 'Pitcairn',
      'PL': 'Poland',
      'PT': 'Portugal',
      'PR': 'Puerto Rico',
      'QA': 'Qatar',
      'RE': 'Réunion',
      'RO': 'Romania',
      'RU': 'Russia',
      'RW': 'Rwanda',
      'BL': 'Saint Barthélemy',
      'SH': 'Saint Helena, Ascension and Tristan da Cunha',
      'KN': 'Saint Kitts and Nevis',
      'LC': 'Saint Lucia',
      'MF': 'Saint Martin (French part)',
      'PM': 'Saint Pierre and Miquelon',
      'VC': 'Saint Vincent and the Grenadines',
      'WS': 'Samoa',
      'SM': 'San Marino',
      'ST': 'Sao Tome and Principe',
      'SA': 'Saudi Arabia',
      'SN': 'Senegal',
      'RS': 'Serbia',
      'SC': 'Seychelles',
      'SL': 'Sierra Leone',
      'SG': 'Singapore',
      'SX': 'Sint Maarten (Dutch part)',
      'SK': 'Slovakia',
      'SI': 'Slovenia',
      'SB': 'Solomon Islands',
      'SO': 'Somalia',
      'ZA': 'South Africa',
      'GS': 'South Georgia and the South Sandwich Islands',
      'KR': 'South Korea',
      'SS': 'South Sudan',
      'ES': 'Spain',
      'LK': 'Sri Lanka',
      'SD': 'Sudan',
      'SR': 'Suriname',
      'SJ': 'Svalbard and Jan Mayen',
      'SE': 'Sweden',
      'CH': 'Switzerland',
      'SY': 'Syrian Arab Republic',
      'TW': 'Taiwan',
      'TJ': 'Tajikistan',
      'TZ': 'Tanzania',
      'TH': 'Thailand',
      'TL': 'Timor-Leste',
      'TG': 'Togo',
      'TK': 'Tokelau',
      'TO': 'Tonga',
      'TT': 'Trinidad and Tobago',
      'TN': 'Tunisia',
      'TR': 'Türkiye',
      'TM': 'Turkmenistan',
      'TC': 'Turks and Caicos Islands',
      'TV': 'Tuvalu',
      'UG': 'Uganda',
      'UA': 'Ukraine',
      'AE': 'United Arab Emirates',
      'GB': 'United Kingdom',
      'UM': 'United States Minor Outlying Islands',
      'US': 'United States of America',
      'UY': 'Uruguay',
      'UZ': 'Uzbekistan',
      'VU': 'Vanuatu',
      'VE': 'Venezuela',
      'VN': 'Viet Nam',
      'VG': 'Virgin Islands (British)',
      'VI': 'Virgin Islands (U.S.)',
      'WF': 'Wallis and Futuna',
      'EH': 'Western Sahara',
      'YE': 'Yemen',
      'ZM': 'Zambia',
      'ZW': 'Zimbabwe'
    };
  }

})();
