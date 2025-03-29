class Calculator {
            constructor(previousOperandElement, currentOperandElement) {
                this.previousOperandElement = previousOperandElement;
                this.currentOperandElement = currentOperandElement;
                this.clear();
            }

            clear() {
                this.currentOperand = '0';
                this.previousOperand = '';
                this.operation = undefined;
                this.resetScreen = false;
            }

            delete() {
                this.currentOperand = this.currentOperand.toString().slice(0, -1);
                if (this.currentOperand === '') {
                    this.currentOperand = '0';
                }
            }

            appendNumber(number) {
                if (number === '.' && this.currentOperand.includes('.')) return;
                if (this.currentOperand === '0' || this.resetScreen) {
                    this.currentOperand = number.toString();
                    this.resetScreen = false;
                } else {
                    this.currentOperand = this.currentOperand.toString() + number.toString();
                }
            }

            chooseOperation(operation) {
                if (this.currentOperand === '') return;
                if (this.previousOperand !== '') {
                    this.compute();
                }
                this.operation = operation;
                this.previousOperand = this.currentOperand;
                this.currentOperand = '';
            }

            compute() {
                let computation;
                const prev = parseFloat(this.previousOperand);
                const current = parseFloat(this.currentOperand);
                if (isNaN(prev) || isNaN(current)) return;

                switch (this.operation) {
                    case '+':
                        computation = prev + current;
                        break;
                    case '-':
                        computation = prev - current;
                        break;
                    case '×':
                        computation = prev * current;
                        break;
                    case '÷':
                        computation = prev / current;
                        break;
                    default:
                        return;
                }

                this.currentOperand = computation.toString();
                this.operation = undefined;
                this.previousOperand = '';
                this.resetScreen = true;
            }

            updateDisplay() {
                this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
                if (this.operation != null) {
                    this.previousOperandElement.innerText = 
                        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
                } else {
                    this.previousOperandElement.innerText = '';
                }
            }

            getDisplayNumber(number) {
                const stringNumber = number.toString();
                const integerDigits = parseFloat(stringNumber.split('.')[0]);
                const decimalDigits = stringNumber.split('.')[1];
                let integerDisplay;
                if (isNaN(integerDigits)) {
                    integerDisplay = '';
                } else {
                    integerDisplay = integerDigits.toLocaleString('en', {
                        maximumFractionDigits: 0
                    });
                }
                if (decimalDigits != null) {
                    return `${integerDisplay}.${decimalDigits}`;
                } else {
                    return integerDisplay;
                }
            }

            toggleSign() {
                this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
            }

            percentage() {
                this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
            }
        }

        const numberButtons = document.querySelectorAll('[data-number]');
        const operationButtons = document.querySelectorAll('[data-action="add"], [data-action="subtract"], [data-action="multiply"], [data-action="divide"]');
        const equalsButton = document.querySelector('[data-action="equals"]');
        const clearButton = document.querySelector('[data-action="clear"]');
        const signButton = document.querySelector('[data-action="sign"]');
        const percentButton = document.querySelector('[data-action="percent"]');
        const decimalButton = document.querySelector('[data-action="decimal"]');

        const previousOperandElement = document.getElementById('previous-operand');
        const currentOperandElement = document.getElementById('current-operand');

        const calculator = new Calculator(previousOperandElement, currentOperandElement);

        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                calculator.appendNumber(button.dataset.number);
                calculator.updateDisplay();
            });
        });

        operationButtons.forEach(button => {
            button.addEventListener('click', () => {
                let operation;
                switch(button.dataset.action) {
                    case 'add': operation = '+'; break;
                    case 'subtract': operation = '-'; break;
                    case 'multiply': operation = '×'; break;
                    case 'divide': operation = '÷'; break;
                }
                calculator.chooseOperation(operation);
                calculator.updateDisplay();
            });
        });

        equalsButton.addEventListener('click', () => {
            calculator.compute();
            calculator.updateDisplay();
        });

        clearButton.addEventListener('click', () => {
            calculator.clear();
            calculator.updateDisplay();
        });

        signButton.addEventListener('click', () => {
            calculator.toggleSign();
            calculator.updateDisplay();
        });

        percentButton.addEventListener('click', () => {
            calculator.percentage();
            calculator.updateDisplay();
        });

        decimalButton.addEventListener('click', () => {
            calculator.appendNumber('.');
            calculator.updateDisplay();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= 0 && e.key <= 9) {
                calculator.appendNumber(e.key);
                calculator.updateDisplay();
            } else if (e.key === '.') {
                calculator.appendNumber('.');
                calculator.updateDisplay();
            } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
                let operation;
                switch(e.key) {
                    case '+': operation = '+'; break;
                    case '-': operation = '-'; break;
                    case '*': operation = '×'; break;
                    case '/': operation = '÷'; break;
                }
                calculator.chooseOperation(operation);
                calculator.updateDisplay();
            } else if (e.key === 'Enter' || e.key === '=') {
                calculator.compute();
                calculator.updateDisplay();
            } else if (e.key === 'Escape') {
                calculator.clear();
                calculator.updateDisplay();
            } else if (e.key === '%') {
                calculator.percentage();
                calculator.updateDisplay();
            } else if (e.key === 'Backspace') {
                calculator.delete();
                calculator.updateDisplay();
            }
        });