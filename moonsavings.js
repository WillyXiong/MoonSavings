var totalIncome = 0;
var totalExpense = 0;

// event listeners that are ready to be called
$(document).ready(function () {
  $('#add-income').click(addIncome);
  $('#remove-income').click(removeIncome);
  $('#expense-form').submit(addCategory);
  $(document).on('click', '.delete-category', deleteCategory);
  $(document).on('click', '.add-subclass', addSubclass);
  $(document).on('click', '.delete-subclass', deleteSubclass);
  $("#income-error").hide();
  $("#category-error").hide();
  $("#created-subcategories").hide();
  $("#expense-error").hide();
  $("#subclass-error").hide();
  $('#default-category').change(function () {
    var selectedDefaultCategory = $(this).val();
    if (selectedDefaultCategory) {
      $('#category').val(selectedDefaultCategory);
    }
  });
});

// jquery UI widget odometer.
var incomeOdometer = new Odometer({
  el: document.querySelector("#total-income"), // replaces the total-income
  format: '(,ddd).dd',
});

// Update the odometer value with the current totalIncome
incomeOdometer.update(totalIncome); 


// function to updating progress bar
function updateProgressBars() {
  $('.category-container').each(function () {
    var categoryContainer = $(this);
    var progressBar = categoryContainer.find('.progress-bar');
    var totalPercentage = 0;

    categoryContainer.find('.sub-class-item').each(function () {
      var expenseString = $(this).find('.sub-class-text').text(); // gets the expense
      var expense = parseFloat(expenseString.substring(expenseString.indexOf('$') + 1)); // converts
      totalPercentage = (expense / (totalIncome + totalExpense)) * 100; //calculate the overall percentage
    });

    // style about logic for the progress bar
    progressBar.css('width', totalPercentage + '%');
    progressBar.toggleClass('empty-bar', totalPercentage === 100);
    progressBar.toggleClass('filled-bar', totalPercentage < 100);
  });
}

// add income function
function addIncome() {
  let incomeInput = $("<input type='text' placeholder='Enter income'>").addClass('income-input'); // creates an input type
  let addButton = $("<button>Add</button>").addClass('add-income-button'); // creates a button

  // Create a container for the income input and the button
  let container = $('<div>').addClass('income-container');

  // append to a container 
  container.append(incomeInput);
  container.append(addButton);

  // total-income will hold the container
  $("#total-income").append(container);

  incomeInput.focus();

  // add button function
  addButton.click(function () {
    let income = parseFloat(incomeInput.val());
    if (isNaN(income) || income <= 0) {
      $("#income-error").show();
    } else {
      totalIncome += income;
      updateTotalIncome(); // once user input income, the total is updated
      $(".error").hide(); 
      updateProgressBars(); // Update progress bars
      incomeInput.val(''); // empty input value
    }
  });
}

// set current income to 0 
function removeIncome() {
  totalIncome = 0;
  updateTotalIncome();
  $('#total-income').text('$0.00');
}

// updates the total 
function updateTotalIncome() {
  // Update the odometer value with the new totalIncome
  incomeOdometer.update(totalIncome);
}

// when form is submit add a category function is called
function addCategory(event) {
  event.preventDefault();
  var category = $('#category').val();
  var defaultCategory = $('#default-category').val();

  // Check if a default category is selected
  if (defaultCategory) {
    // Update the category input with the selected default category
    $('#category').val(defaultCategory);
  }

  // Check if the category input is empty
  if (category === '') {
    $('#category-error').show();
    return; // Stop further execution
  } else {
    $('#category-error').hide();
    var categoryContainer = $('<div>').addClass('category-container');
    var categoryHeading = $('<h3>').text(category);
    var deleteButton = $('<button>').addClass('delete-category').text('X');
    categoryHeading.append(deleteButton);

    // creating a progress bar. appears for every category added
    var progressBarContainer = $('<div>').addClass('progress-bar-container');
    var progressBar = $('<div>').addClass('progress-bar').data('total-income', totalIncome);
    progressBarContainer.append(progressBar);

    
    var subclasses = $('<div>').addClass('created-subclasses');
    var subClassContainer = $('#sub-category').clone().removeAttr('id').show();
    categoryContainer.append(categoryHeading, progressBarContainer, subclasses, subClassContainer);

    $('#categories').append(categoryContainer);
    $('#category').val('');
  }

  // ajax request from json file. Prints message with a fade in and out effect.
  $.ajax({
    url: "moonSavings.json",
    type: "GET",
    dataType: 'json',
    success: function (data) {
      var display = '';
      for (var i in data) { // set i to find json values
        display += data[i]['success-message']; // runs through the json
      }
      $('#added-category').html(display).hide().fadeIn(1000);

      setTimeout(function () {
        $('#added-category').fadeOut(1000, function () {
          $(this).empty().show();
        });
      }, 3000);
    },
  });
}

// deletes a added category
function deleteCategory(event) {
  var $category = $(this).closest('.category-container');
  $category.find('.sub-class-item').each(function () {
    var expenseString = $(this).find('.sub-class-text').text(); // gets the expense and converts it
    var expense = parseFloat(expenseString.substring(expenseString.indexOf('$') + 1));
    totalIncome += expense;
  });
  updateTotalIncome(); // once category is deleted, all expense from the category is added back to total
  $category.remove(); // removes category
}

// after category is added, a subclass and expense input are availble
function addSubclass() {
  let subClassInput = $(this).siblings('.subclass-input');
  let expenseInput = $(this).siblings('.expense-input');
  let subClass = subClassInput.val();
  let expense = parseFloat(expenseInput.val());

  // continue if logic is correct
  if (subClass !== '' && !isNaN(expense)) {
    var categoryContainer = $(this).closest('.category-container');
    var progressBar = categoryContainer.find('.progress-bar');
    var subclasses = categoryContainer.find('.created-subclasses');
    var deleteButton = $('<button>').addClass('delete-subclass').text('X');

    // remove previous event listener from delete button
    deleteButton.off('click').click(deleteSubclass);

    // add the expense to the totalExpense
    totalExpense += expense;

    // subtract expense from totalIncome, if expense is less than total income
    if (expense <= totalIncome) {
      var subClassContainer = $('<div>').addClass('sub-class-item');
      var subClassText = $('<span>').addClass('sub-class-text').text(subClass + ': ');
      var expenseAmount = $('<span>').addClass('expense-amount').text('$' + expense.toFixed(2));
      subClassText.append(expenseAmount);
      subClassContainer.append(subClassText, deleteButton);
      subclasses.append(subClassContainer);
      subClassInput.val('');
      expenseInput.val('');
      totalIncome -= expense;
      updateTotalIncome();
      $("#expense-error").hide();
      $("#subclass-error").hide();

      // calculate the percentage for the progress bar
      var percentage = (expense / (totalIncome + totalExpense)) * 100;

      // update progress bar
      progressBar.css('width', percentage + '%');
      progressBar.text(percentage.toFixed(0) + '%');
      progressBar.toggleClass('empty-bar', percentage === 100);
      progressBar.toggleClass('filled-bar', percentage < 100);
      updateProgressBars(); // Update progress bars

    } else {
      $("#expense-error").show();
    }
  } else {
    $("#subclass-error").show();
  }
}

// delete a subclass. 
function deleteSubclass() {
  var expenseString = $(this).siblings('.sub-class-text').text();
  var expense = parseFloat(expenseString.substring(expenseString.indexOf('$') + 1));
  totalIncome += expense / 2; // deleted subclass also deletes expense.
  updateTotalIncome(); // update total
  $(this).closest('.sub-class-item').remove();
  updateProgressBars(); // Update progress bars
}

