/* TO-DO LIST

Добавить event handler
Получить данные из полей ввода
Добавить новый пункт в нашу структуру данных
Добавить новый пункт в пользовательский интерфейс
Рассчитать бюджет
Обновить пользовательский интерфейс

Модули 
Модуль UI:
Получить данные из полей ввода
Добавить новый пункт в пользовательский интерфейс
Обновить пользовательский интерфейс
Модуль данных:
Добавить новый пункт в нашу структуру данных
Рассчитать бюджет
Модуль-оператор(контроллер-модуль):
Добавить event handler (обработчик событий)



Часть вторая 
Добавить обработчик событий
Удалить элемент из нашей структуры данных
Удалить элемент в UI
Пересчитать бюджет
Обновить UI

Часть третья
Рассчитать проценты
Обновить их в UI
Отобразить текущий месяц и год
Отформатировать числа
Улучшить поле ввода UX (опыт пользователя - впечатление пользователя от работы с вашим интерфейсом)
*/


// BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {

        return this.percentage;

    };

   var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }; 
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // Создаем новый ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Создаем новый пункт, основанный на типе 'exp' или 'inc'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Добавляем в нашу структуру данных
            data.allItems[type].push(newItem);
            
            // Возвращаем новый элемент
            return newItem;
        },
         
        deleteItem: function(type, id) {
            var ids,index;
            
            // id = 3
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {

            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });

            return allPerc;

        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
    
    
})();


// UI CONTROLLER
var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {

        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2000 -> 2,000.00
        */
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {

        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }

    };

    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // доходы или расходы
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };    
            
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Создать строку HTML с placeholder-ом
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                } else if (type === 'exp') {
                    element = DOMStrings.expensesContainer;

                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
            
            // Заменить placeholder фактическими данными, которые получим от объекта
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            
            // Вставить HTML в DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },
        
        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });

        },

        displayDate: function() {
            var now, months, month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    }
    
    
})();


// CLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {

                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        // 1. Рассчитать бюджет
        budgetCtrl.calculateBudget();
        
        // 2. Вернуть бюджет
        var budget = budgetCtrl.getBudget();
        
        // 3. Отобразить бюджет на пользовательском интерфейсе
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
         // 1. Получить входные данные
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Добавить пункт к budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Добавить новый элемент на пользовательский интерфейс
            UICtrl.addListItem(newItem, input.type);

            // 4. Очистить поле ввода
            UICtrl.clearFields();

            // 5. Рассчитать и обновить бюджет
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();












