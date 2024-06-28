const BASE_URL = "/api";

let popUp = {
  btn: document.querySelector(".pop-up__send-btn"),
  animation: document.querySelector(".pop-up__loading-animation"),
  successMsg: document.querySelector(".pop-up__msg_success"),
  errorMsg: document.querySelector(".pop-up__msg_error"),
  inps: document.querySelector(".pop-up__inps"),
  nameInp: document.querySelector(".pop-up__name-inp"),
  phoneInp: document.querySelector(".pop-up__phone-inp"),
  textArea: document.querySelector(".pop-up__textarea-inp"),
  timeInp: document.querySelector(".pop-up__time-inp"),
  callRadio: document.querySelector(".pop-up__radio-inp_call"),
  whatsAppRadio: document.querySelector(".pop-up__radio-inp_whatsapp"),
  telegramRadio: document.querySelector(".pop-up__radio-inp_telegram"),
  counter: document.querySelector(".pop-up__textarea-symb-counter-current"),
};

function setStep(step) {
  // "user writes data" || "captcha is solving" || "success" || "error"
  switch (step) {
    case "user writes data":
      popUp.btn.classList.add("pop-up__send-btn_active");
      popUp.animation.classList.remove("pop-up__loading-animation_active");
      popUp.successMsg.classList.remove("pop-up__msg_active");
      popUp.errorMsg.classList.remove("pop-up__msg_active");
      popUp.inps.classList.add("pop-up__inps_active");
      break;
    case "captcha is solving":
      popUp.btn.classList.remove("pop-up__send-btn_active");
      popUp.animation.classList.add("pop-up__loading-animation_active");
      popUp.successMsg.classList.remove("pop-up__msg_active");
      popUp.errorMsg.classList.remove("pop-up__msg_active");
      popUp.inps.classList.add("pop-up__inps_active");
      break;
    case "success":
      popUp.btn.classList.remove("pop-up__send-btn_active");
      popUp.animation.classList.remove("pop-up__loading-animation_active");
      popUp.successMsg.classList.add("pop-up__msg_active");
      popUp.errorMsg.classList.remove("pop-up__msg_active");
      popUp.inps.classList.remove("pop-up__inps_active");
      break;
    case "error":
      popUp.btn.classList.remove("pop-up__send-btn_active");
      popUp.animation.classList.remove("pop-up__loading-animation_active");
      popUp.successMsg.classList.remove("pop-up__msg_active");
      popUp.errorMsg.classList.add("pop-up__msg_active");
      popUp.inps.classList.remove("pop-up__inps_active");
      break;
  }
}

IMask(document.querySelector(".pop-up__phone-inp"), {
  mask: "+{7}(000)000-00-00",
});

function callForm() {
  document.querySelector(".pop-up")?.classList.add("pop-up_active");
  popUp.nameInp.value = "";
  popUp.phoneInp.value = "";
  popUp.textArea.value = "";
  setStep("user writes data");
}

function closeForm() {
  document.querySelector(".pop-up")?.classList.remove("pop-up_active");
}

async function getCaptcha() {
  const response = await fetch(`${BASE_URL}/pow/request`);
  const preparedResp = await response.json();
  return preparedResp;
}

async function solveCaptcha({ difficulty, seed, signature, timestamp }) {
  let key = "";
  let found = false;

  while (!found) {
    key = generateRandomKey(6);

    const concatenatedString = seed + key;
    let buffer = new TextEncoder().encode(concatenatedString);
    let hashBuffer = crypto.subtle.digest("SHA-256", buffer);
    let hashArray = new Uint8Array(await hashBuffer);

    let isZero = true;
    for (let i = 0; i < difficulty; i++) {
      if (hashArray[i] !== 0) {
        isZero = false;
        break;
      }
    }

    if (isZero) {
      found = true;
    }
  }

  captchaIsSolved = true;
  return {
    difficulty,
    seed,
    signature,
    timestamp,
    key,
  };
}

async function sendAnswer({ difficulty, seed, signature, timestamp, key }) {
  const response = await fetch(`${BASE_URL}/pow/challenge`, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify({ difficulty, seed, signature, timestamp, key }), // body data type must match "Content-Type" header
  });
  const preparedResp = await response.json();
  if (preparedResp.session) {
    return preparedResp.session;
  } else {
    setStep("error");
  }
}

async function sendData(session) {
  let data = {
    title: document.title,
    name: popUp.nameInp.value,
    method: document.querySelector(".pop-up__radio-inp:checked").value,
    contact: popUp.phoneInp.value,
    text: popUp.textArea.value,
    session: session,
  };
  if (popUp.timeInp.value) {
    data.time = popUp.timeInp.value;
  }
  const response = await fetch(`${BASE_URL}/send`, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  if (response.status == 200) {
    setStep("success");
  } else {
    setStep("error");
  }
}

function checkIfFormIsValid() {
  let formIsValid = true;
  [popUp.nameInp, popUp.phoneInp, popUp.textArea].forEach((inp) => {
    if (inp.value) {
      inp.classList.remove("inp_red");
    } else {
      formIsValid = false;
      inp.classList.add("inp_red");
    }
  });
  if (popUp.textArea.value.length > 3000) {
    formIsValid = false;
  }
  if (
    !popUp.phoneInp.value.match(
      /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/
    )
  ) {
    formIsValid = false;
    popUp.phoneInp.classList.add("inp_red");
  }
  return formIsValid;
}

[...document.querySelectorAll(".summon-form-btn")].forEach((summonBtn) => {
  summonBtn.addEventListener("click", (e) => {
    callForm(e);
  });
});

document.querySelector(".pop-up__close-btn").addEventListener("click", (e) => {
  closeForm(e);
});

popUp.textArea.addEventListener("input", () => {
  popUp.counter.innerHTML = popUp.textArea.value.length;
  if (popUp.textArea.value.length > 3000) {
    document
      .querySelector(".pop-up__textarea-symb-counter")
      .classList.add("pop-up__textarea-symb-counter_alarm");
  } else {
    document
      .querySelector(".pop-up__textarea-symb-counter")
      .classList.remove("pop-up__textarea-symb-counter_alarm");
  }
});

[popUp.callRadio, popUp.telegramRadio, popUp.whatsAppRadio].forEach((radio) => {
  radio.addEventListener("change", () => {
    if (document.querySelector(".pop-up__radio-inp:checked").value == "call") {
      popUp.timeInp.classList.add("pop-up__time-inp_active");
    } else {
      popUp.timeInp.classList.remove("pop-up__time-inp_active");
    }
  });
});

document
  .querySelector(".pop-up__send-btn")
  .addEventListener("click", async (e) => {
    if (checkIfFormIsValid()) {
      setStep("captcha is solving");
      let captcha = await getCaptcha();
      let solvedCaptcha = await solveCaptcha(captcha);
      let session = await sendAnswer(solvedCaptcha);
      sendData(session);
    }
  });

// Чес
// Функция для вычисления SHA-256 хеша в виде бинарной строки
function sha256(input) {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(input))
    .then((hashBuffer) => {
      let hashArray = Array.from(new Uint8Array(hashBuffer));
      let hashHex = hashArray
        .map((b) => ("00" + b.toString(16)).slice(-2))
        .join("");
      return hashHex;
    });
}

// Функция для подсчета ведущих нулевых битов в бинарной строке
function countLeadingZeros(binaryString) {
  let count = 0;
  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === 0) {
      count++;
    } else {
      break;
    }
  }
  return count;
}
// Вспомогательная функция для генерации случайного ключа
function generateRandomKey(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
