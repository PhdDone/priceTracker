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
        url: 'http://www.bestbuy.com',
        priceOld: 100,
        priceNew: 90,
        head: 1,
        timeOld: new Date('December 17, 1994 03:24:00'),
        timeNew: new Date('December 17, 1995 03:24:00'),
        store: 'bestbuy'
    }
];

var generateData = function () {
    var stores = ["bestbuy", "staples", "microsoftstore"];
    for (var i = 0; i < 100; ++i) {
        var storeIndex = Math.floor(Math.random() * 3);
        demoData.push({
            id: 1,
            title: 'Laptop' + i,
            url: 'http://www.' + stores[storeIndex] + '.com',
            priceOld: 90 + i,
            priceNew: 110 - i,
            timeOld: new Date(),
            timeNew: new Date(),
            head: 1,
            store: stores[storeIndex]
        });
    }
    console.log(demoData[0])
};

console.log(demoData);

var appViewModel = function () {
    var self = this;
    self.allItems = ko.observableArray([]);
    self.items = ko.observableArray([]);

    self.storeId = ko.observable('bestbuy');

    var Initialize = function () {
        self.searchItemsByStore('bestbuy');
    };

    var Item = function (item) {
        var self = this;
        self.title = item.title;
        self.url = item.url;
        self.priceOld = item.priceOld;
        self.priceNew = item.priceNew;
        self.store = item.store;
        self.timeOld = item.timeOld;
        self.timeNew = item.timeNew;
        self.priceDrop = self.priceOld - self.priceNew
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


    self.getStoreId = function () {
        return self.storeId();
    };

    self.setStoreId = function (storeId) {
        return self.storeId(storeId);
    };

    self.toBestbuy = function () {
        self.searchItemsByStore("bestbuy");
    };

    self.toMicrosoft = function () {
        self.searchItemsByStore("microsoftstore");
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

    self.searchItemsByStore = function (storeId) {
        self.setStoreId(storeId);
        self.setItemsByStore();
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
    };

    generateData();
    LoadData();
    Initialize();

};

$(document).ready(function() {
    ko.applyBindings(new appViewModel());
    $('#DroppedItems').DataTable( { responsive: true } );
} );