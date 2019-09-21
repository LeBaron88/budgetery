// Budget Controller
var BudgetController = (function(){
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
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
        data.allItems[type].forEach(function(current){
            sum += current.value;
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
        addItem: function(type, desc, val) {
            var newItem, ID;
            // create new ID
            if(data.allItems[type].lenght) ID = data.allItems[type][data.allItems[type].lenght - 1].id + 1;
            else ID = 0;

            // Create new item based on inc or exp type
            if(type === "exp"){
                newItem = new Expense(ID, desc, val);
            } else if(type === "inc"){
                newItem = new Income(ID, desc, val);
            }

            // add new item on the array 
            data.allItems[type].push(newItem);

            // return the new item
            return newItem;
        },

        delItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that was spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
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
    };


})();

// UI Controller
var UIController = (function() {
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensePercLabel: ".item__percentage",
        dateLabel: '.budget__title--month'
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
            
        }
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    return {
        getInput: function() { 
            return {
                type: document.querySelector(DOMStrings.inputType).value, // could be inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        getDOMStrings: function() {
            return DOMStrings;
        },

        addListItem: function(obj, type) {
            var html, finalHtml, element;
            // Create html string with placeholder text 
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="icon ion-ios-close-circle-outline"></i></button> </div> </div> </div>';
            } else if(type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="icon ion-ios-close-circle-outline"></i></button></div></div></div>';
            }
            
            // Replace placeholder with actual data
            finalHtml = html.replace('%id%', obj.id);
            finalHtml = finalHtml.replace('%description%', obj.description);
            finalHtml = finalHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert html in the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', finalHtml);
        },

        delListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            //fieldsArray = Array.prototype.slice(fields);
            fields.forEach(function(current, index, array) {
                current.value = "";
            });
            fields[0].focus();
        },

        displayBudget: function(obj) {
            var type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            }else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensePercLabel);

            nodeListForEach(fields, function(current, index){

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                }else{
                    current.textContent = "---";   
                }
            });
        },

        displayMonth: function() {
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
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            
        },

    };


})();

// Application Controller
var AppController = (function(bgtCtrl, UICtrl){

    var setUpEventListeners = function() {

        var DOM =  UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);  
    };

    var updateBudget = function() {
        // Calculate budget
        bgtCtrl.calculateBudget();

        // Return budget
        var budgetObject = bgtCtrl.getBudget();

        // Display budget on UI
        UICtrl.displayBudget(budgetObject);
    };

    var updatePercentage = function() {
        // Calculate percentages
        bgtCtrl.calculatePercentages();

        // Read percentages from the Budget controller
        var percentages = bgtCtrl.getPercentages();

        // Update UI
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {

        var input, newItem;
        // Get input
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            // Add new Item to budget controller
            newItem = bgtCtrl.addItem(input.type, input.description, input.value);

            // Add new Item to UI controller
            UICtrl.addListItem(newItem, input.type);

            // Clear fields
            UICtrl.clearFields();

            // Calculate and Update Budget
            updateBudget();

            // Update and calculate percentages
            updatePercentage();
        }
    };

    var ctrlDelItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete item from Budget controller
            bgtCtrl.delItem(type, ID);

            // Delete item from UI
            UIController.delListItem(itemID);

            // Update and show budget totals
            updateBudget();
        }
    };

    return {
        init: function() {
            console.log("Application has started");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalExp: 0,
                totalInc: 0});
            setUpEventListeners();
        }
    }
    

})(BudgetController, UIController);

AppController.init();