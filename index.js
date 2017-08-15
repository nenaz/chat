(function ($) {
    var connections = [];
    var uid = Math.random().toString(36).substr(2);
    var userName;

    /**
    * создать подключение к серверу и если оно удалось, вызвать функцию "авторизации"
    */
    function connect() {
        socketObj = new WebSocket('ws://localhost:5000/', 'echo-protocol');
        socketObj.onopen = function() {
            console.log("Connection established");
            auth();
        };
        socketObj.onmessage = function(event) {
            console.log(event.data);
            createChatElement(JSON.parse(event.data), true);
        };
        socketObj.onerror = function(error) {
            console.log('error');
        };
        socketObj.onclose = function(e) {
            console.log('close');
        };
        return socketObj;
    }
    /**
    * закрыть все соединения
    */
    function closeAll() {
        for (var i=0; i<connections.length; i++) {
            connections[i].close();
        }
    }
    /**
    * блок непосредственно строки чата с элементами
    * @param message - тескт сообщения
    * @param incoming - признак входящего(true)/исходящего(false) сообщения
    */
    function createRowTableElem(message, incoming) {
        var elem = document.createElement('div');
        elem.className = 'rowTableElem';
        elem.className += (incoming) ? ' incoming' : '';
        elem.append(createMessageElem(message, incoming));
        elem.append(createTimeElem());
        return elem;
    }
    /**
    * элемент отображения текстового сообщения
    * @param message - тескт сообщения
    * @param incoming - признак входящего(true)/исходящего(false) сообщения
    */
    function createMessageElem(message, incoming) {
        var elem = document.createElement('div');
        elem.textContent = message;
        elem.className = (incoming) ? 'incoming' : 'outgoing';
        return elem;
    }
    /**
    * элемент отображения времени обработки сообщения на клиенте
    */
    function createTimeElem() {
        var elem = document.createElement('div');
        elem.textContent = getTimeHM();
        elem.className = 'cellElemTime';
        return elem;
    }
    /**
    * блок элементов строки чата для отображения входящих и исходящих сообщений
    * @param message - тескт сообщения
    * @param incoming - признак входящего(true)/исходящего(false) сообщения
    */
    function createUserElement(message, incoming) {
        var elem = document.createElement('div');
        elem.className = 'userDialog';
        elem.append(createRowTableElem(message, incoming));
        return elem;
    }
    /**
    * блок для каждого уникального чата
    * @param data - данные пришедшие с сервера
    * @param incoming - признак входящего(true)/исходящего(false) сообщения
    */
    function createChatElement(data, incoming) {
        if (document.getElementsByClassName(data.uid).length === 0) {
            var elem = document.createElement('div');
            elem.className = 'chat ' + data.uid;
            elem.append(createSummaryBlock(data, incoming));
            elem.append(createControllButtons(data.uid));
            $('.messages').append(elem);
            createEventHandlerForControlButtons(document.getElementsByClassName('sendMessage ' + data.uid)[0], 'click', sendMessage.bind(data.uid));
        } else {
            document.getElementsByClassName('summary ' + data.uid)[0].append(createUserElement(data.message, incoming));
        }
    }
    function createSummaryBlock(data, incoming) {
        var elem = document.createElement('div');
        elem.className = 'summary ' + data.uid;
        elem.append(createUserElement(data.message, incoming));
        return elem;
    }
    /**
    * формирование управляющих кнопок для каждого нового окна чата
    */
    function createControllButtons(uid) {
        var elem = document.createElement('div');
        var input = document.createElement('input');
        var button = document.createElement('button');
        var buttonClose = document.createElement('button');
        elem.className = 'buttonsBlock ' + uid;
        input.className = "sendText " + uid;
        button.className = "sendMessage " + uid;
        button.textContent = "Send";
        buttonClose.className = 'close ' + uid;
        buttonClose.textContent = "Close conection";
        elem.append(input);
        elem.append(button);
        elem.append(buttonClose);
        return elem;
    }
    /**
    * "авторизация" на сервере по имени польователя и uid
    */
    function auth() {
        userName = document.getElementById('userName').value || 'Support';
        var data = {
                type: 'auth',
                uid: uid,
                userName: userName
            };
        socketObj.send(JSON.stringify(data));
    }
    /**
    * вернуть текущее время в миллесекундах
    */
    function getNowTime() {
        var d = new Date;
        return d.getTime();
    }
    /**
    * вернуть текущее время в часа и минутах
    */
    function getTimeHM() {
        var d = new Date(),
            nowH = formatDate(d.getHours()),
            nowMin = formatDate(d.getMinutes());
        return nowH + ':' + nowMin;
    }
    /**
    * форматирование чисел < 10
    */
    function formatDate (str) {
        return ('0' + str).slice(-2);
    };
    /**
    * функция навешивания события на элемент
    * @param elem - элемент для навешивания события
    * @param event - тип события
    * @param callback - функция которая будет вызвана
    */
    function createEventHandlerForControlButtons(elem, event, callback) {
        elem.addEventListener(event, callback);
    }




    $('#connect').on('click', function (e) {
        connections.push(connect());
    });
    // $('#close').on('click', function (e) {
        // closeAll();
    // });
    $('#sendMessage').on('click', function (e) {
        var data = {
            type: 'chat',
            message: document.getElementById('sendText').value,
            fromUID: uid,
            to: 'Support',
            time: getNowTime(),
            userName: userName
        }
        createChatElement(data, false);
        socketObj.send(JSON.stringify(data));
    });

    /**
    * функция отправки сообщения
    */
    function sendMessage(thuid) {
        var thisUID = this.split()[0],
            data = {
            type: 'chat',
            message: document.getElementsByClassName('sendText ' + thisUID)[0].value,
            fromUID: uid,
            to: thisUID,
            time: getNowTime(),
            userName: userName
        }
        createChatElement(data, false);
        socketObj.send(JSON.stringify(data));
    }
    // window.connections = connections;
})(jQuery);