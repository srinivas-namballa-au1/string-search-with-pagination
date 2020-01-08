const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

var app = express();

app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: false }));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));

//data
let data = [
    {
        name: "Srinivas Namballa",
        age: 25,
        empid: 001,
        nationality: 'Indian'
    },

    {
        name: "Tamila Rasi Palanivel",
        age: 28,
        empid: 002,
        nationality: 'Indian'
    },

    {
        name: "Raj",
        age: 54,
        empid: 003,
        nationality: 'Indian'
    },

    {
        name: "Solai",
        age: 40,
        empid: 004,
        nationality: 'Indian'
    },

    {
        name: "Sushmith",
        age: 46,
        empid: 005,
        nationality: 'Indian'
    },

    {
        name: "Sedhu",
        age: 34,
        empid: 006,
        nationality: 'Indian'
    },

    {
        name: "Vishnu",
        age: 25,
        empid: 007,
        nationality: 'Indian'
    },

    {
        name: "Murali",
        age: 28,
        empid: 008,
        nationality: 'Indian'
    },

    {
        name: "Magesh",
        age: 28,
        empid: 009,
        nationality: 'Indian'
    },

    {
        name: "Joshy",
        age: 40,
        // empid: 010,
        empid: 10,
        nationality: 'Indian'
    },

    {
        name: "Rajath",
        age: 27,
        empid: 11,
        nationality: 'India'
    },

    {
        name: "Shruti",
        age: 26,
        empid: 12,
        nationality: 'Inidan'
    },

    {
        name: "Shubho",
        age: 48,
        empid: 13,
        nationality: 'Australia'
    },

    {
        name: "Rajesh",
        age: 22,
        empid: 14,
        nationality: 'Indian'
    },

    {
        name: "Naveen",
        age: 22,
        empid: 15,
        nationality: 'Indian'
    }
];

// fields
let arr = ["name", "age", "empid", "nationality"];

let response = [];

//pagination
function paginatedResults(model) {
    return (req, res, next) => {
        //pagination
        const page = parseInt(req.query.page);
        // const limit = parseInt(req.query.limit);
        const limit = 3;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {};

        let pages = Math.ceil(model.length/limit);

        if (endIndex < model.length) {
            results.next = {
                current: page,
                page: page + 1,
                limit: limit,
                pages: pages
            }
        }

        if (startIndex > 0) {
            results.previous = {
                current: page,
                page: page - 1,
                limit: limit,
                pages: pages
            }
        }


        results.results = model.slice(startIndex, endIndex);
        res.paginatedResults = results;
        next();
    }
}

// Sorting
function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }
  
      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }

  global.order = 'desc';

app.get('/', paginatedResults(data.sort(compareValues('name', global.order))), (req, res) => {
    // global.order = 'desc';
    console.log("Home order: ", global.order, typeof global.order);
    // console.log(global.order);
    res.paginatedResults.results = res.paginatedResults.results.sort(compareValues(req.query.field, global.order));
    // console.log("res pagination: ", res.paginatedResults.results, res.paginatedResults.length);
    
    global.order = (global.order === 'desc') ? 'asc' : 'desc';

    res.render('search.hbs', {
        response: res.paginatedResults.results,
        responsePagination: res.paginatedResults, 
        responsePaginationNext: res.paginatedResults.next,
        responsePaginationPrevious: res.paginatedResults.previous,
        search: '',
        order: global.order
    });
});

app.post('/', (req, res) => {
    let search = req.body.search;
    app.locals.search = search;

    response.length = 0;

    console.log("EMPTY RESPONSE: ", response);
    // let arr = ["name", "age", "empid", "nationality"];

    for (let i = 0; i < data.length; i++) {

        // This is for empty search element
        if (search === '' || search === null) {
            // console.log("DATA: ", data);

            return res.redirect('/?page=1');
        }

        // 1st solution
        // if(data[i].name.includes(search) || data[i].age.toString().includes(search) || data[i].empid.toString().includes(search) || data[i].nationality.includes(search)) {
        //     console.log(`Search -> ${data[i].name.includes(search)} Name Data -> ${data[i].name}`)
        //     response.push({name: data[i].name, age: data[i].age, empid: data[i].empid, nationality: data[i].nationality});
        // }

        // one more solution(2nd solution)
        for (let j = 0; j < arr.length; j++) {
            if (data[i][arr[j]].toString().toLowerCase().includes(search.toLowerCase())) {
                response.push(data[i]);
                break;
            }
            continue;
        }
    }

    global.reload = false;

    if(response.length === 0) {
        return res.render('search.hbs', {res:"No records found"});
    }
    res.redirect('/search?page=1');
});

app.get('/search', paginatedResults(response.sort(compareValues('name', global.order))), (req, res) => {

    global.reload = !global.reload;

    let search = req.app.locals.search;

    console.log("search order: ", global.order);

    res.paginatedResults.results = res.paginatedResults.results.sort(compareValues(req.query.field, global.order));
    
    global.order = (global.order === 'desc') ? 'asc' : 'desc';

    if(global.reload) {
        res.render('search.hbs', {response:res.paginatedResults.results, search: search, 
                                    searchResponsePagination: res.paginatedResults, searchResponsePaginationNext: res.paginatedResults.next, 
                                    searchResponsePaginationPrevious: res.paginatedResults.previous, order: global.order});
    } else {
        global.reload = !global.reload;
        res.render('search.hbs', {response:res.paginatedResults.results, search: '', 
            searchResponsePagination: res.paginatedResults, searchResponsePaginationNext: res.paginatedResults.next, 
            searchResponsePaginationPrevious: res.paginatedResults.previous, order: global.order});
    }

});

app.listen(3000, () => {
    console.log("App running on port 3000!");
});