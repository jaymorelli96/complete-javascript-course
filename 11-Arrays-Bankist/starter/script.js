'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  console.log(movs);
  movs.forEach((movement, index) => {
    //Check what type of movement it is. (Deposit or Withdrawal)
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    //Generate the html code that will be inserted into the dom.
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">
      ${index + 1} ${type}
      </div>
      <div class="movements__value">${movement}</div>
    </div>
    `;

    //Insert html
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUsernames = accounts => {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(e => e[0])
      .join('');
  });
};

createUsernames(accounts);

const calcBalance = movements => {
  const balance = movements.reduce((acc, mov) => acc + mov, 0);
  return balance;
};

const displayBalance = balance => {
  labelBalance.textContent = `${balance}€`;
};

const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(e => e > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const outcome = acc.movements
    .filter(e => e < 0)
    .reduce((acc, mov) => acc + Math.abs(mov), 0);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * (acc.interestRate / 100))
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumIn.textContent = `${incomes}€`;
  labelSumOut.textContent = `${outcome}€`;
  labelSumInterest.textContent = `${interest}€`;
};

const displayMovBalSum = acc => {
  //Display movements
  displayMovements(acc.movements);
  //Display balance
  displayBalance(calcBalance(acc.movements));
  //Display summary
  calcDisplaySummary(acc);
};

//Event Handler
let currentAccount;

btnLogin.addEventListener('click', e => {
  //Prevent reloading
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin == inputLoginPin.value) {
    //Display UI and message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    //Display movements balance and summary
    displayMovBalSum(currentAccount);
    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
  }
});

btnTransfer.addEventListener('click', e => {
  //Prevent default reload
  e.preventDefault();

  //Get amount to be transferred to and the other account
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => {
    return acc.username === inputTransferTo.value;
  });
  inputTransferAmount.value = inputTransferTo.value = '';

  //Get current balance
  let currentBalance = calcBalance(currentAccount.movements);

  //Make the transfer in case the balance is enough
  if (
    currentBalance >= amount &&
    amount > 0 &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    displayMovBalSum(currentAccount);
  }
});

btnClose.addEventListener('click', e => {
  //Prevent default reload
  e.preventDefault();

  //Check credentials
  let userCheck = currentAccount.username === inputCloseUsername.value;
  let pinCheck = currentAccount.pin == inputClosePin.value;

  console.log(userCheck, pinCheck);

  if (userCheck && pinCheck) {
    let i = accounts.findIndex(acc => acc.username === currentAccount.username);
    accounts.splice(i, 1);

    currentAccount = undefined;
    containerApp.style.opacity = 0;
  }
});

btnLoan.addEventListener('click', e => {
  //Prevent default reload
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //Add movement
    currentAccount.movements.push(amount);
    displayMovBalSum(currentAccount);
  }

  inputLoanAmount.value = '';
});

let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
