import Options from './checkforce-options';
import ProgressHtml from './progress-html';

/**
 * checkforce.js
 *
 * @author Jaime Neves <https://github.com/dejaneves>
 * @license MIT
 */

/**
 * @param {String|HTMLElement} input
 * @param {Object} options
 */

const CheckForce = (input, optionsParams) => {

  const CheckForceOptions = new Options(input,optionsParams);
  const options = CheckForceOptions.getOptions();

  if (typeof input === 'string') {
    input = document.querySelector(input);
  }

  // Create options by extending defaults with the passed in arugments
  //options = typeof options === 'object' ? extendDefaults(defaults, options) : defaults;

  const checkPassword = (callback) => {
    let trigger = document.querySelector(options.trigger.selector);

    if (!trigger) {
      throw new Error('Element ' + options.trigger.selector + ' must exist to init the trigger')
    }

    trigger.addEventListener(options.trigger.eventListener, () => {
      options.scores = 0;

      // Check Length
      lengthPassword();
      // Check Letters
      lettersPassword();
      // Check Numbers
      numberPassword();
      // Check Characters
      charactersPassword();
      // Text of password
      textForce();

      options.width = options.scores * 1.25 > 100 ? 100 : options.scores * 1.25;

      if(options.scores > 0){
        if (options.BootstrapTheme && !options.MaterializeTheme)
          renderBootstrap();
        else if (options.MaterializeTheme && !options.BootstrapTheme)
          renderMaterialize();
        else
          options.content = options.text;
      } else {
          options.content = "";
          options.text = "";
      }

      callback({
        scores: options.scores,
        width: options.width,
        text: options.text,
        content: options.content,
        charsSpecialCheck: options.charsSpecialCheck,
        numberCheck: options.numberCheck,
        uppercaseCheck: options.uppercaseCheck,
        lowercaseCheck: options.lowercaseCheck
      });
    });
  };

  /**
   * Run on node environment
   * @param  {String} password
   * @return {Object}
   */
  const checkPasswordNode = (password) => {
    options.scores = 0;
    input = { value: password };
    // Check Length
    lengthPassword();
    // Check Letters
    lettersPassword();
    // Check Numbers
    numberPassword();
    // Check Characters
    charactersPassword();
    // Text of password
    textForce();

    return {
      scores: options.scores,
      charsSpecialCheck: options.charsSpecialCheck,
      numberCheck: options.numberCheck,
      uppercaseCheck: options.uppercaseCheck,
      lowercaseCheck: options.lowercaseCheck
    };
  };

  /**
   * check length of the password
   */
  const lengthPassword = () => {
    let pwdlength = input.value.length;

    if (pwdlength > options.passIndex && pwdlength < options.minimumChars) {
      options.scores += 5;
    } else if ((pwdlength >= options.minimumChars) && (pwdlength <= options
        .maximumChars)) {
      options.scores += 10;
    } else if (pwdlength > options.maximumChars) {
      options.scores += 25;
    }
  }

  /**
   * Check the letters in the password
   * @return {Integer}
   */
  const lettersPassword = () => {
    let password = input.value,
      upperCount = countContain(password, options.uppercase),
      lowerCount = countContain(password, options.lowercase),
      haveLowercase = false,
      haveUppercase = false,
      lengthLowercase = 0,
      lengthUppercase = 0;

    if (upperCount === 0 && lowerCount !== 0) {
      options.scores += 10;
      haveLowercase = true;
      lengthLowercase = lowerCount;
    }
    if (lowerCount === 0 && upperCount !== 0) {
      options.scores += 10;
      haveUppercase = true;
      lengthUppercase = upperCount;
    }

    if (upperCount !== 0 && lowerCount !== 0) {
      options.scores += 20;
      haveLowercase = true;
      haveUppercase = true;
      lengthLowercase = lowerCount;
      lengthUppercase = upperCount;
    }

    options.lowercaseCheck.haveLowercase = haveLowercase;
    options.lowercaseCheck.lengthLowercase = lengthLowercase;
    options.uppercaseCheck.haveUppercase = haveUppercase;
    options.uppercaseCheck.lengthUppercase = lengthUppercase;
  }

  /**
   * Check number in the password
   */
  const numberPassword = () => {
    var password = input.value,
      numberCount = countContain(password, options.number);

    if (numberCount === 1 || numberCount === 2)
      options.scores += 10;

    if (numberCount >= 3)
      options.scores += 20;

    options.numberCheck.haveNumber = numberCount !== 0 ? true : false;
    options.numberCheck.lengthNumber = numberCount;
  }

  /**
   * Check characters special in the password
   * @return {Integer}
   */
  const charactersPassword = () => {
    let password = input.value,
      scores = 0,
      characterCount = countContain(password, options.characters);

    if (characterCount === 1)
      scores += 10;

    if (characterCount > 1)
      scores += 25;

    options.scores += scores;
    options.charsSpecialCheck.haveChars = scores > 0 ? true : false;
    options.charsSpecialCheck.lengthChars = scores > 0 ? characterCount : 0;
  }

  /**
   * Check text of force of password
   */
  const textForce = () => {
    if (options.scores <= 30) {
      options.text = CheckForceOptions.getVerdicts()[options.locale][0];
    }
    if (options.scores > 30 && options.scores <= 60) {
      options.text = CheckForceOptions.getVerdicts()[options.locale][1];
    }
    if (options.scores > 60 && options.scores <= 80) {
      options.text = CheckForceOptions.getVerdicts()[options.locale][2];
    }
    if (options.scores > 80) {
      options.text = CheckForceOptions.getVerdicts()[options.locale][3];
    }
  }

  const renderBootstrap = () => {
    var container = document.createElement('div');
    var progressContainer = document.createElement('div');
    progressContainer.setAttribute('class', 'progress');
    var classBg;

    if (options.scores <= 30) {
      classBg = "progress-bar progress-bar-danger";
    }
    if (options.scores > 30 && options.scores <= 60) {
      classBg = "progress-bar progress-bar-warning";
    }
    if (options.scores > 60 && options.scores <= 80) {
      classBg = "progress-bar progress-bar-info";
    }
    if (options.scores > 80) {
      classBg = "progress-bar progress-bar-success";
    }

    let progressHtml = new ProgressHtml(options.width,classBg,options.text);
    let progressBar = progressHtml.getProgressBar();

    progressContainer.appendChild(progressBar);
    container.appendChild(progressContainer);
    options.content = container.innerHTML;
  }

  const renderMaterialize = () => {
    var container = document.createElement('div');
    var progressContainer = document.createElement('div');
    progressContainer.setAttribute('class', 'progress');
    var classBg;

    if (options.scores <= 30) {
      classBg = "progress-bar-danger";
    }
    if (options.scores > 30 && options.scores <= 60) {
      classBg = "progress-bar-warning";
    }
    if (options.scores > 60 && options.scores <= 80) {
      classBg = "progress-bar-info";
    }
    if (options.scores > 80) {
      classBg = "progress-bar-success";
    }

    let progressHtml = new ProgressHtml(options.width,classBg,options.text);
    let progressBar = progressHtml.getProgressBar();

    progressContainer.appendChild(progressBar);
    container.appendChild(progressContainer);
    options.content = container.innerHTML;
  }

  return {
    checkPassword,
    checkPasswordNode
  }

};

// Checks a string for a list of characters
const countContain = (strPassword, strCheck) => {
  let count = 0,
    lengthPwd = strPassword.length;

  for (let i = 0; i < lengthPwd; i++) {
    if (strCheck.indexOf(strPassword.charAt(i)) > -1) {
      count++;
    }
  }
  return count;
}

export default CheckForce;
