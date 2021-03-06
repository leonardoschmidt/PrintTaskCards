function PrintTaskCards(rallyDataSource) {
	var iterationDropdown;
        
	function displayCards(results) {
        var estimate, loginName, ownerClass, ownerText, storyId, taskId, name, description, i, theMarkup, data, userTable;

        userTable = buildUserTable(results.users);

        data = results[CARD_TYPE];

        for (i = 0; i < data.length; i++) {
            name = data[i].Name;
            if (name.length > MAX_NAME_LEN) {
                name = name.substring(0, MAX_NAME_LEN);
                name += "...";
            }

            loginName = data[i].Owner;
            if (typeof loginName === 'undefined' || loginName === null) {
                ownerClass = "NoOwner";
                ownerText = "No Owner";
            } else {
                ownerClass = loginName.UserName.replace(/[@|\.]/g, "");
                ownerText = makeOwnerText(loginName, userTable);
            }

            if (CARD_TYPE === 'stories') {
                storyId = data[i].FormattedID;
                taskId = "";
            } else {
                storyId = data[i].WorkProduct.FormattedID;
                taskId = results.tasks[i].FormattedID;
            }

            if (data[i].PlanEstimate) {
                estimate = data[i].PlanEstimate;
            } else if (data[i].Estimate) {
                estimate = data[i].Estimate;
            } else {
                estimate = "None";
            }

            description = data[i].Description;

            theMarkup = createMarkup(i, data.length, name, ownerText, ownerClass, description, storyId, taskId, estimate);

            dojo.byId("cards").innerHTML += theMarkup;
        }

        ownerPopulate(results);
	}

	function buildUserTable(userData) {
        var table = {};
        for (var i = 0; i < userData.length; i++) {
            table[userData[i].LoginName] = userData[i].DisplayName;
        }
        return table;
	}

	function makeOwnerText(loginName, userTable) {
        if (typeof userTable[loginName] === 'undefined' || userTable[loginName] === '') {
            return loginName._refObjectName.split('@');
        } else {
            return userTable[loginName];
        }
	}

	function createMarkup(cardIndex, totalCards, name, ownerText, ownerClass, description, storyId, taskId, estimate) {
        var theMarkup, id;
        var currentCardNumber = cardIndex + 1;
        if (CARD_TYPE === 'stories') {
            id = storyId;
        } else {
            id = taskId + ':' + storyId;
        }

        theMarkup = '<div class="artifact">' +
                    '<div class="header">' +
                    '<span class="storyID">' + id + '</span>' +
                    '<span class="owner ' + ownerClass + '">' + '</span>' +
                    '<span class="ownerText">' + ownerText + '</span>' +
                    '</div>' +
                    '<div class="content">' +
                    '<div class="card-title">' + name + '</div>' +
                    '<div class="description">' + description + '</div>' +
                    '</div>' +
                    '<span class="estimate">' + estimate + '</span>' +
                    '</div>';

        if (currentCardNumber !== totalCards && currentCardNumber % 4 === 0) {
            theMarkup = theMarkup + '<div class=pb></div>';
        }

        return theMarkup;
	}

	function ownerPopulate(results) {
        function showOwnerImage(ownerNode) {
          ownerNode.innerHTML = "<IMG SRC='" + ownerImage + "'/>";
        }

        for (i = 0; i < results.users.length; i++) {
            var ownerName = results.users[i].UserName.replace(/[@|\.]/g, "");
            var ownerImage = rally.sdk.util.Ref.getUserImage(results.users[i], 40);
            dojo.forEach(dojo.query("." + ownerName), showOwnerImage);
        }
	}

	function runQuery() {
        dojo.empty(dojo.byId("cards"));
        var queryArray = [];

        queryArray[0] = {
            key: CARD_TYPE,
            type: CARD_TYPE,
            query: '(Iteration.Name contains "' + iterationDropdown.getSelectedName() + '")',
            fetch: 'Name,Iteration,WorkProduct,Owner,FormattedID,Estimate,ObjectID,Description,UserName',
            order: 'Rank'
        };
        queryArray[1] = {
            key: 'users',
            type: 'users',
            fetch: 'UserName,ObjectID,DisplayName'
        };
        rallyDataSource.findAll(queryArray, displayCards);
	}

	function getStyleSheet() {
        var styleSheet;
        dojo.forEach(dojo.query('style'), function(s) {
            if (s.title == 'printCards') {
                styleSheet = s;
            }
        });
        return styleSheet.innerHTML;
	}

	function printPop() {
        var title, options, printWindow, doc, fileref, cardMarkup;

        title = CARD_TYPE.slice(0, 1).toUpperCase() + CARD_TYPE.slice(1);
        options = "toolbar=1,menubar=1,scrollbars=yes,scrolling=yes,resizable=yes,width=1000,height=500";
        printWindow = window.open('', title, options);
        doc = printWindow.document;

        cardMarkup = dojo.byId("printSection").innerHTML;

        doc.write('<html><head><title>' + iterationDropdown.getSelectedName() + ' ' + title + '</title>');
        doc.write('<style>');
        doc.write(getStyleSheet());
        doc.write('</style>');
        doc.write('</head><body class="landscape">');
        doc.write(cardMarkup);
        doc.write('</body></html>');
        doc.close();

        printWindow.print();
        return false;
	}

  this.display = function(element) {
        iterationDropdown = new rally.sdk.ui.IterationDropdown({}, rallyDataSource);
        iterationDropdown.display("iterationDropdown", runQuery);

        var config = {
            text: "Print " + APP_TYPE + " Cards",
            value: "myValue"
        };
        var button = new rally.sdk.ui.basic.Button(config);
        button.display("buttonDiv", printPop);
  }; 
}
