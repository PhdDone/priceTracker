$(function () {
    $('.navbar-toggle-sidebar').click(function () {
        $('.navbar-nav').toggleClass('slide-in');
        $('.side-body').toggleClass('body-slide-in');
        $('#search').removeClass('in').addClass('collapse').slideUp(200);
    });
});


/* Demo data */
var demoData = [
    {
        id: 1,
        title: 'Laptop 1',
        url: 'www.bestbuy.com',
        price: 90,
        drop: 10,
        head: 1,
        store: 'bestbuy'
    },
    {
        id: 2,
        title: 'Laptop 2',
        url: 'www.bestbuy.com',
        price: 90,
        drop: 10,
        head: 1,
        store: 'bestbuy'
    },
    {
        id: 3,
        title: 'Laptop 3',
        url: 'www.staples.com',
        price: 90,
        drop: 10,
        head: 1,
        store: 'staples'
    },
    {
        id: 4,
        title: 'Laptop 4',
        url: 'www.staples.com',
        price: 100,
        drop: 10,
        head: 1,
        store: 'staples'
    },
    {
        id: 5,
        title: 'Laptop 5',
        url: 'www.ms.com',
        price: 100,
        drop: 10,
        head: 1,
        store: 'microsoft'
    }
];

var generateData = function () {
    for (var i = 0; i < 100; ++i) {
        demoData.push({
            id: 1,
            title: 'Laptop' + i,
            url: 'www.bestbuy.com',
            price: 90,
            drop: i,
            head: 1,
            store: 'bestbuy'
        });
    }
};

var directions = {
    ascending: 1,
    descending: 2
};
var defaultDirection = directions.descending;
var defaultSortColumn = 'drop';

var appViewModel = function () {
    var self = this;
    self.allItems = ko.observableArray([]);
    self.items = ko.observableArray([]);

    self.storeId = ko.observable('bestbuy');

    // Search and sort parameters
    self.searchQuery = ko.observable(''); // Empty search query by default

    self.sortColumn = ko.observable(defaultSortColumn); // By default, sorting by title
    self.sortDirection = ko.observable(defaultDirection); // By default, sorting in descending direction

    var Initialize = function () {
        self.searchItemsByStore('bestbuy');

    };
    var Item = function (item) {
        var self = this;
        self.title = item.title;
        self.url = item.url;
        self.price = item.price;
        self.drop = item.drop;
        self.store = item.store;
    };

    self.sortItemsList = function (left, right) {
        var column = self.sortColumn();
        var leftValue = column == 'drop' ? left.drop : left.title;
        var rightValue = column == 'drop' ? right.drop : right.title;
        var isDescending = self.sortDirection() == directions.descending;

        if (leftValue - rightValue > 0) {

            return isDescending ? -1 : 1;
        }

        return leftValue - rightValue == 0 ? 0 : 1
    };

    var LoadData = function () {
        demoData.forEach(function (item) {
            self.allItems.push(new Item(item));
        });
    };

    self.searchItemsByTitle = function () {
        self.setItemsByTitle();
    };

    self.getStoreId = function () {
        return self.storeId();
    };

    self.setStoreId = function (storeId) {
        return self.storeId(storeId);
    };

    self.searchItemsByStore = function (storeId) {
        self.setStoreId(storeId);
        self.setItemsByStore();
    };

    self.toBestbuy = function () {
        self.searchItemsByStore("bestbuy");
    };

    self.toMicrosoft = function () {
        self.searchItemsByStore("microsoft");
    };

    self.toStaples = function () {
        self.searchItemsByStore("staples");
    };

    self.setItemsByStore = function () {
        var currentStore = self.getStoreId();
        self.items.removeAll();
        console.log(currentStore);
        for (var i = 0; i < self.allItems().length; i++) {
            var item = self.allItems()[i],
                store = item.store || '';

            // Filter items out by folder id
            if (currentStore != store) {
                continue;
            }
            self.items.push(item);
        }
        if (self.items().length > 0) {
            self.items.sort(self.sortItemsList);
        }
    };

    self.setItemsByTitle = function () {
        var query = (self.searchQuery() || '').toLowerCase();
        //var currentStore = typeof currentStore !== 'undefined' ?  currentStore : (self.getStoreId() || '');
        var currentStore = self.getStoreId() || '';
        self.items.removeAll();

        for (var i = 0; i < self.allItems().length; i++) {
            var item = self.allItems()[i],
                store = item.store || '';

            // Filter items out by store id
            if (currentStore != store) {
                continue;
            }

            // Filter items out by search query
            if (query && item.title.toLowerCase().indexOf(query) < 0) {
                continue;
            }

            self.items.push(item);
        }

        if (self.items().length > 0) {
            self.items.sort(self.sortItemsList);
        }

    };

    generateData();
    LoadData();
    Initialize();

};

$(document).ready(function () {
    ko.applyBindings(new appViewModel());
});
