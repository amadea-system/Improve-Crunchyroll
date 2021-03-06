function parseNumber(number) {
  let numberMinutes = Math.floor(number / 60);
  let numberSeconds = number - numberMinutes * 60;
  return numberMinutes > 0
    ? `${numberMinutes}:${numberSeconds < 10 ? `0${numberSeconds}` : numberSeconds}`
    : numberSeconds;
}

function translate(key) {
  const label = chrome.i18n.getMessage(key);
  return label !== '' ? label : key;
}

function createFastForwardBackwardButtons() {
  icDivPlayerControls.innerHTML = '';
  let buttonList = [];
  (chromeStorage.fast_backward_buttons.length > 0 ? chromeStorage.fast_backward_buttons.split(',') : []).forEach(
    (fastBackwardNumber) => {
      const fastBackwardButton = document.createElement('div');
      fastBackwardButton.innerHTML = `«${parseNumber(fastBackwardNumber)}`;
      fastBackwardButton.title = `${chrome.i18n.getMessage('KEY_FAST_BACKWARD')} ${parseNumber(fastBackwardNumber)}`;
      fastBackwardButton.addEventListener(
        'click',
        () => (document.getElementById('player0').currentTime -= ~~fastBackwardNumber)
      );
      buttonList.push(fastBackwardButton);
    }
  );
  (chromeStorage.fast_forward_buttons.length > 0 ? chromeStorage.fast_forward_buttons.split(',') : []).forEach(
    (fastForwardNumber) => {
      const fastForwardButton = document.createElement('div');
      fastForwardButton.innerHTML = `${parseNumber(fastForwardNumber)}»`;
      fastForwardButton.title = `${chrome.i18n.getMessage('KEY_FAST_FORWARD')} ${parseNumber(fastForwardNumber)}`;
      fastForwardButton.addEventListener(
        'click',
        () => (document.getElementById('player0').currentTime += ~~fastForwardNumber)
      );
      buttonList.push(fastForwardButton);
    }
  );
  buttonList.forEach((button) => {
    button.classList.add('ic_buttons');
    icDivPlayerControls.appendChild(button);
  });
}

function createDivs() {
  icDivPlayerControls = document.createElement('div');
  icDivPlayerMode = document.createElement('div');
  [icDivPlayerControls, icDivPlayerMode].forEach((div) => {
    div.className = 'ic_div';
    div.addEventListener('mouseup', () => {
      event.stopPropagation();
    });
  });

  createPlayerButton();
  createPlayerSettings();
  createFastForwardBackwardButtons();
}

function scrollBarChange() {
  chrome.storage.local.set({
    scrollbar: chromeStorage.scrollbar ? false : true,
  });
}

function playerMode1Change() {
  chrome.storage.local.set({
    theater_mode: !chromeStorage.theater_mode,
    player_mode:
      chromeStorage.player_mode === 0 || chromeStorage.player_mode === 1
        ? !chromeStorage.theater_mode
          ? 1
          : 0
        : chromeStorage.player_mode,
  });
}

function playerMode2Change() {
  chrome.storage.local.set({
    player_mode: (chromeStorage.player_mode === 2 ? 0 : 2) === 2 ? 2 : chromeStorage.theater_mode ? 1 : 0,
  });
}

function createPlayerButton() {
  [
    {
      className: 'scrollbar',
      chromeStorageKey: 'scrollbar',
      title: 'KEY_SCROLLBAR',
      onChange: scrollBarChange,
    },
    {
      className: 'theater_mode',
      chromeStorageKey: 'theater_mode',
      title: 'KEY_THEATER_MODE',
      onChange: playerMode1Change,
    },
    {
      className: 'fullscreen_mode',
      chromeStorageKey: 'player_mode',
      eq: 2,
      title: 'KEY_FULLSCREEN_MODE',
      onChange: playerMode2Change,
    },
  ].forEach((button) => {
    let span = document.createElement('span');
    span.className = `ic_buttons ${button.className}`;
    span.title = chrome.i18n.getMessage(button.title);
    span.addEventListener('click', button.onChange);
    icDivPlayerMode.appendChild(span);
  });
}

function createSettingsDiv(title, value, type) {
  const div = document.createElement('div');
  div.className = 'ic_menu';
  div.id = `ic_${type}_menu`;
  div.innerHTML = `
    <div class="font">${title}</div>
    <div class="right">
      <div class="right_text">
        <span class="font">
          ${value}
        </span>
      </div>
      <div class="next"></div>
    </div>`;
  div.addEventListener('click', () => {
    document.getElementById('vilosSettingsMenu').setAttribute('ic_options', 'hide');
    window.location.hash = type;
  });
  return div;
}

function createSettingsOptionsDiv(title, type, options, value, callback) {
  const div = document.createElement('div');
  div.id = type;
  div.className = 'ic_settings';
  const back = document.createElement('div');
  div.appendChild(back);
  back.className = `ic_back`;
  back.innerHTML = `
    <div class="back"></div>
    <div class="font">${title}</div>`;
  back.addEventListener('click', () => {
    const vilosSettingsMenu = document.getElementById('vilosSettingsMenu');
    vilosSettingsMenu.setAttribute('ic_options', 'menu');
    window.location.hash = '';
  });
  const optionsDiv = document.createElement('div');
  div.appendChild(optionsDiv);
  optionsDiv.className = `ic_options`;
  options.forEach((option) => {
    const optionDIv = document.createElement('div');
    let optionValueName = option.name ? translate(option.name) : option.value;
    optionDIv.className = 'ic_option';
    optionDIv.innerHTML = `
      <svg viewBox="0 0 20 20" style="height: 20px; width: 20px;">
      <circle
        class="bg"
        cx="10"
        cy="10"
        r="9"
        style="fill: rgb(25, 46, 56); opacity: 1;"
      ></circle>
      <circle
        class="dot"
        cx="10"
        cy="10"
        r="4"
        style="fill: rgb(68, 195, 171);"
      ></circle>
      <path
        class="outer_circle"
        d="M10,2a8,8,0,1,1-8,8,8.009,8.009,0,0,1,8-8m0-2A10,10,0,1,0,20,10,10,10,0,0,0,10,0Z"
        style="fill: rgb(160, 160, 160);"
      ></path>
      </svg>`;
    const name = document.createElement('span');
    name.className = 'text font';
    name.innerHTML = option.value;
    optionDIv.appendChild(name);
    if (option.type === 'slider') {
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = option.min;
      slider.max = option.max;
      slider.value = option.value;
      slider.step = option.step;
      slider.addEventListener('input', () => {
        const sliderValue = parseFloat(slider.value);
        if (sliderValue === sliderValue) {
          option.value = sliderValue;
          optionValueName = sliderValue;
          name.innerHTML = option.value;
        }
      });
      optionDIv.appendChild(slider);
    }
    optionDIv.setAttribute('value', option.value === value);
    optionDIv.addEventListener('click', () => {
      const selected = document.querySelector('.ic_option[value=true]');
      if (selected) selected.setAttribute('value', false);
      optionDIv.setAttribute('value', true);
      localStorage.setItem(`Vilos:${type}`, option.value);
      document.querySelector(`#ic_${type}_menu .right_text .font`).innerHTML = optionValueName;
      callback(option.value);
    });
    optionsDiv.appendChild(optionDIv);
  });
  return div;
}

function createPlayerSettings() {
  icDivSettings = [];
  [
    {
      title: 'KEY_PLAYBACK_RATE',
      type: 'playbackRate',
      defaultValue: 1,
      values: [
        {
          type: 'slider',
          value: '1',
          min: 0.25,
          max: 2,
          step: 0.05,
        },
        {
          value: 0.25,
        },
        {
          value: 0.5,
        },
        {
          value: 0.75,
        },
        {
          value: 1,
          name: 'KEY_NORMAL',
        },
        {
          value: 1.25,
        },
        {
          value: 1.5,
        },
        {
          value: 1.75,
        },
        {
          value: 2,
        },
      ],
      callback: (value) => (document.getElementById('player0').playbackRate = value),
    },
  ]
    .map((setting) => {
      const localStorageValue = parseFloat(localStorage.getItem(`Vilos:${setting.type}`));
      const value = localStorageValue === localStorageValue ? localStorageValue : setting.defaultValue;
      const title = translate(setting.title);
      const selectedValue = setting.values.find((v) => v.value === value);
      let selectedValueName;
      setting.callback(value);
      if (selectedValue) {
        selectedValueName = selectedValue.name ? translate(selectedValue.name) : selectedValue.value;
      } else {
        selectedValueName = value;
        const slider = setting.values.find((value) => value.type === 'slider');
        if (slider) slider.value = value;
      }
      return [
        createSettingsDiv(title, selectedValueName, setting.type),
        createSettingsOptionsDiv(title, setting.type, setting.values, value, setting.callback),
      ];
    })
    .forEach((list) => list.forEach((div) => icDivSettings.push(div)));
}

function insertCbpDivs(vilosControlsContainer) {
  const controlsBar = vilosControlsContainer.firstElementChild.lastElementChild.children[2];
  if (!controlsBar) return;
  const controlsBarLeft = controlsBar.firstElementChild;
  const controlsBarRight = controlsBar.lastElementChild;
  const controlsBarRightSettingsButton = controlsBarRight.firstElementChild;

  controlsBarLeft.appendChild(icDivPlayerControls);
  controlsBarRight.insertBefore(icDivPlayerMode, controlsBarRight.children[1]);

  new MutationObserver(() => {
    const vilosSettingsMenu = document.getElementById('vilosSettingsMenu');
    if (vilosSettingsMenu) {
      vilosSettingsMenu.setAttribute('ic_options', 'menu');
      window.location.hash = '';
      const firstElementChild = vilosSettingsMenu.firstElementChild;
      icDivSettings.forEach((icDivSetting) => {
        vilosSettingsMenu.insertBefore(icDivSetting, firstElementChild);
      });
      new MutationObserver(() => {
        vilosSettingsMenu.setAttribute(
          'ic_options',
          document.querySelector('[data-testid="vilos-settings_back_button"]') ? 'submenu' : 'menu'
        );
      }).observe(vilosSettingsMenu, {
        childList: true,
      });
    }
  }).observe(controlsBarRightSettingsButton, {
    childList: true,
  });
}

function observeVelocityControlsPackageDiv() {
  new MutationObserver((mutationsList) => {
    const addedNode = mutationsList[mutationsList.length - 1].addedNodes[0];
    if (addedNode && addedNode.id === 'vilosControlsContainer' && addedNode.hasChildNodes()) insertCbpDivs(addedNode);
  }).observe(document.getElementById('velocity-controls-package'), {
    childList: true,
  });
}

function init() {
  createDivs();
  if (document.getElementById('velocity-controls-package')) {
    observeVelocityControlsPackageDiv();
  } else {
    new MutationObserver((mutationsList, observer) => {
      observer.disconnect();
      observeVelocityControlsPackageDiv();
    }).observe(document.getElementById('vilosRoot'), {
      childList: true,
    });
  }
  document.onfullscreenchange = () => {
    document.documentElement.setAttribute('ic_fullscreen', document.fullscreenElement ? true : false);
  };
  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.fast_backward_buttons || changes.fast_forward_buttons) {
      createFastForwardBackwardButtons();
    }
  });
}

let icDivPlayerControls;
let icDivPlayerMode;
let icDivSettings;

setTimeout(init);
