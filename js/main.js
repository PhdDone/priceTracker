$(function () {
    $('.navbar-toggle-sidebar').click(function () {
        $('.navbar-nav').toggleClass('slide-in');
        $('.side-body').toggleClass('body-slide-in');
        $('#search').removeClass('in').addClass('collapse').slideUp(200);
    });
});

(function () {
    // Private function
    function getColumnsForScaffolding(data) {
        if ((typeof data.length !== 'number') || data.length === 0) {
            return [];
        }
        var columns = [];
        for (var propertyName in data[0]) {
            columns.push({ headerText: propertyName, rowText: propertyName });
        }
        return columns;
    }

    ko.simpleGrid = {
        // Defines a view model class you can use to populate a grid
        viewModel: function (configuration) {
            this.data = configuration.data;
            this.currentPageIndex = ko.observable(0);
            this.pageSize = configuration.pageSize || 5;

            // If you don't specify columns configuration, we'll use scaffolding
            this.columns = configuration.columns || getColumnsForScaffolding(ko.unwrap(this.data));

            this.itemsOnCurrentPage = ko.computed(function () {
                var startIndex = this.pageSize * this.currentPageIndex();
                return ko.unwrap(this.data).slice(startIndex, startIndex + this.pageSize);
            }, this);

            this.maxPageIndex = ko.computed(function () {
                return Math.ceil(ko.unwrap(this.data).length / this.pageSize) - 1;
            }, this);
        }
    };

    // Templates used to render the grid
    var templateEngine = new ko.nativeTemplateEngine();

    templateEngine.addTemplate = function(templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };

    templateEngine.addTemplate("ko_simpleGrid_grid", "\
                    <table class=\"ko-grid\" cellspacing=\"0\">\
                        <thead>\
                            <tr data-bind=\"foreach: columns\">\
                               <th data-bind=\"text: headerText\"></th>\
                            </tr>\
                        </thead>\
                        <tbody data-bind=\"foreach: itemsOnCurrentPage\">\
                           <tr data-bind=\"foreach: $parent.columns\">\
                               <td data-bind=\"text: typeof rowText == 'function' ? rowText($parent) : $parent[rowText] \"></td>\
                            </tr>\
                        </tbody>\
                    </table>");
    templateEngine.addTemplate("ko_simpleGrid_pageLinks", "\
                    <div class=\"ko-grid-pageLinks\">\
                        <span>Page:</span>\
                        <!-- ko foreach: ko.utils.range(0, maxPageIndex) -->\
                               <a href=\"#\" data-bind=\"text: $data + 1, click: function() { $root.currentPageIndex($data) }, css: { selected: $data == $root.currentPageIndex() }\">\
                            </a>\
                        <!-- /ko -->\
                    </div>");

    // The "simpleGrid" binding
    ko.bindingHandlers.simpleGrid = {
        init: function() {
            return { 'controlsDescendantBindings': true };
        },
        // This method is called to initialize the node, and will also be called again if you change what the grid is bound to
        update: function (element, viewModelAccessor, allBindings) {
            var viewModel = viewModelAccessor();

            // Empty the element
            while(element.firstChild)
                ko.removeNode(element.firstChild);

            // Allow the default templates to be overridden
            var gridTemplateName      = allBindings.get('simpleGridTemplate') || "ko_simpleGrid_grid",
                pageLinksTemplateName = allBindings.get('simpleGridPagerTemplate') || "ko_simpleGrid_pageLinks";

            // Render the main grid
            var gridContainer = element.appendChild(document.createElement("DIV"));
            ko.renderTemplate(gridTemplateName, viewModel, { templateEngine: templateEngine }, gridContainer, "replaceNode");

            // Render the page links
            var pageLinksContainer = element.appendChild(document.createElement("DIV"));
            ko.renderTemplate(pageLinksTemplateName, viewModel, { templateEngine: templateEngine }, pageLinksContainer, "replaceNode");
        }
    };
})();

/* Demo data */
var demoData = [
    {
        id: 1,
        title: 'Laptop 1',
        url: 'www.bestbuy.com',
        priceOld: 100,
        priceNew: 90,
        head: 1,
        store: 'bestbuy'
    },
    {
        id: 2,
        title: 'Laptop 2',
        url: 'www.bestbuy.com',
        priceOld: 100,
        priceNew: 90,
        head: 1,
        store: 'bestbuy'
    },
    {
        id: 3,
        title: 'Laptop 3',
        url: 'www.staples.com',
        priceOld: 100,
        priceNew: 90,
        head: 1,
        store: 'staples'
    },
    {
        id: 4,
        title: 'Laptop 4',
        url: 'www.staples.com',
        priceOld: 120,
        priceNew: 90,
        head: 1,
        store: 'staples'
    },
    {
        id: 5,
        title: 'Laptop 5',
        url: 'www.ms.com',
        priceOld: 110,
        priceNew: 90,
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
            priceOld: 90 + i,
            priceNew: 110 - i,
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
        self.gridViewModel = new ko.simpleGrid.viewModel({
            data: self.items,
            columns: [
                { headerText: "Title", rowText: "title" },
                { headerText: "Url", rowText: "url"},
                { headerText: "Old Price", rowText: "priceOld" },
                { headerText: "New Price", rowText: "priceNew" },
                { headerText: "Price Drop", rowText: function (item) {
                    return item.priceOld - item.priceNew } },
            ],
            pageSize: 10
        });

        self.searchItemsByStore('bestbuy');
        self.jumpToFirstPage();

    };

    var Item = function (item) {
        var self = this;
        self.title = item.title;
        self.url = item.url;
        self.priceOld = item.priceOld;
        self.priceNew = item.priceNew;
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
        self.jumpToFirstPage();
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


    self.sortByTitle = function() {
        self.items.sort(function(a, b) {
            return a.title < b.title ? -1 : 1;
        });
    };

    self.sortByDrop = function() {
        self.items.sort(function(a, b) {
            var dropa = a.priceOld - a.priceNew;
            var dropb = b.priceOld - b.priceNew;
            return dropa > dropb ? -1 : 1;
        });
    };

    self.jumpToFirstPage = function() {
            self.gridViewModel.currentPageIndex(0);
    };

    generateData();
    LoadData();
    Initialize();

};

$(document).ready(function () {
    ko.applyBindings(new appViewModel());
});
