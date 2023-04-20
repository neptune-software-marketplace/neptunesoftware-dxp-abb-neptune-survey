function setFormBackground(background: string) {
    const setBackground = (value) =>
        document.querySelector<HTMLElement>(":root").style.setProperty("--formBackground", value);

    if (!background) {
        return setBackground("");
    }

    if (background === "bing") {
        return setBackground(`url(https://bing.biturl.top/?resolution=1920&format=image)`);
    }

    setBackground(`url(${background})`);
}

function getTheme() {
    return sap.ui.getCore().getConfiguration().getTheme();
}

const validateMultipleChoice = (validationType, validationParam, response) => {
    let valid = false;

    if (validationType === "noLimit") {
        return { valid: true };
    }

    if (!response) {
        return { valid: false };
    }

    const selections = Object.keys(response);

    switch (validationType) {
        case "equalTo":
            if (selections.length === parseInt(validationParam)) {
                valid = true;
            } else {
                valid = false;
            }
            break;

        case "atMost":
            if (selections.length <= parseInt(validationParam)) {
                valid = true;
            } else {
                valid = false;
            }
            break;

        case "atLeast":
            if (selections.length >= parseInt(validationParam)) {
                valid = true;
            } else {
                valid = false;
            }
            break;

        default:
            break;
    }

    return { valid: valid };
};

function debounce(func, wait, immediate) {
    var timeout;

    return function executedFunction() {
        var context = this;
        var args = arguments;

        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
}
