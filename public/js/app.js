

window.addEventListener('load', () => {
  const el = $('#app');
  var totalData;

  var id;

  // Compile Handlebar Templates
  const errorTemplate = Handlebars.compile($('#error-template').html());
  const ratesTemplate = Handlebars.compile($('#rates-template').html());
  const exchangeTemplate = Handlebars.compile($('#exchange-template').html());
  const historicalTemplate = Handlebars.compile($('#historical-template').html());

  // Instantiate api handler
  const api = axios.create({
    baseURL : 'https://api.npoint.io/e65283a0a2e31b4a35c5',
    // baseURL: 'http://localhost:3000/api',
    // timeout: 5000,
  });

  const router = new Router({
    mode: 'history',
    page404: (path) => {
      const html = errorTemplate({
        color: 'yellow',
        title: 'Error 404 - Page NOT Found!',
        message: `The path '/${path}' does not exist on this site`,
      });
      el.html(html);
    },
  });

  // Display Error Banner
  const showError = (error) => {
    const { title, message } = error.response.data;
    const html = errorTemplate({ color: 'red', title, message });
    el.html(html);
  };

  // Display Latest Currency Rates
  router.add('/', async () => {
    // Display loader first
    let html = ratesTemplate();
    el.html(html);
    try {
   
      const response = await api.get();
      const {comments,furni,posts} =  response.data;
      this.totalData = [...response.data.posts];
      html = ratesTemplate({comments,furni,posts});
      el.html(html);
      $('.loading').removeClass('loading');
    } catch (error) {
      showError(error);
    }
  });


  // Perform POST request, calculate and display conversion results
  const getConversionResults = async () => {
    // Extract form data
    const from = $('#from').val();
    const to = $('#to').val();
    const amount = $('#amount').val();
    // Send post data to express(proxy) server
    try {
      const response = await api.post('/convert', { from, to });
      const { rate } = response.data;
      const result = rate * amount;
      $('#result').html(`${to} ${result}`);
    } catch (error) {
      showError(error);
    } finally {
      $('#result-segment').removeClass('loading');
    }
  };

  // Handle Convert Button Click Event
  const convertRatesHandler = () => {
    if ($('.ui.form').form('is valid')) {
      // hide error message
      $('.ui.error.message').hide();
      // Post to express server
      $('#result-segment').addClass('loading');
      getConversionResults();
      // Prevent page from submitting to server
      return false;
    }
    return true;
  };

  router.add('/exchange', async () => {
var test = JSON.parse(window.localStorage.getItem('selected'))[0];
    try {

      const html = exchangeTemplate(test);
      el.html(html);
      // Load Symbols

      const response = await api.get('/symbols');
      $('.loading').removeClass('loading');
      // Specify Form Validation Rules
      $('.ui.form').form({
        fields: {
          from: 'empty',
          to: 'empty',
          amount: 'decimal',
        },
      });
      // Specify Submit Handler
      $('.submit').click(convertRatesHandler);
    } catch (error) {
      // showError(error);
    }
  });

  const getHistoricalRates = async () => {
    const date = $('#date').val();
    try {
      const response = await api.post('/historical', { date });
      const { base, rates } = response.data;
      const html = ratesTemplate({ base, date, rates });
      $('#historical-table').html(html);
    } catch (error) {
      showError(error);
    } finally {
      $('.segment').removeClass('loading');
    }
  };

  const historicalRatesHandler = () => {
    if ($('.ui.form').form('is valid')) {
      // hide error message
      $('.ui.error.message').hide();
      // Indicate loading status
      $('.segment').addClass('loading');
      getHistoricalRates();
      // Prevent page from submitting to server
      return false;
    }
    return true;
  };

  router.add('/historical', () => {
    const html = historicalTemplate();
    el.html(html);
    // Activate Date Picker
    $('#calendar').calendar({
      type: 'date',
      formatter: {
        date: date => new Date(date).toISOString().split('T')[0],
      },
    });
    $('.ui.form').form({
      fields: {
        date: 'empty',
      },
    });
    $('.submit').click(historicalRatesHandler);
  });

  router.navigateTo(window.location.pathname);

  // Highlight Active Menu on Load
  const link = $(`a[href$='${window.location.pathname}']`);
  link.addClass('active');

  $('a').on('click', (event) => {
    // Block page load
    event.preventDefault();

    // Highlight Active Menu on Click
    const target = $(event.target);
    $('.item').removeClass('active');
    target.addClass('active');

    // Navigate to clicked url
    const href = target.attr('href');
    const path = href.substr(href.lastIndexOf('/'));
    router.navigateTo(path);
  });
});

function klikaj(i)
{
  event.preventDefault();
   this.id = parseInt(event.currentTarget.id);

  let selectedData =  this.totalData.filter(function(hero) {
    return hero.id === id;
});
window.localStorage.setItem('selected', JSON.stringify(selectedData));
  window.location.pathname = "/exchange";
  // router.navigateTo(window.location.pathname);
}