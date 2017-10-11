
ymaps.ready(function () {
    var mapCenter = [55.755381, 37.619044],
        map = new ymaps.Map('map', {
            center: mapCenter,
            zoom: 10,
            //controls: []
        });
    map.behaviors.disable([
        'scrollZoom' // удаляем свойство zoom по колёсику
    ]);
    map.controls.add('routeButtonControl');  // добавили кнопку составления маршрута
    map.controls
        .remove('trafficControl') // удалили кнопку - пробки
        .remove('ruleControl'); // убрали линейку

    var storage = sessionStorage;

    console.log('Карта загружена-!!!');
        if (storage.Review) { // при наличии хранилища очищаем его
            // storage.Review = JSON.stringify('');
            storage.clear();
            console.log('Хранилище - storage.Review - очищено');
        }

    // Создаем собственный макет с информацией о выбранном геообъекте.
    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h3 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h3>' +
            '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>'+ '<br>' +
            '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    var clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        // Устанавливаем собственный макет.
        clusterBalloonItemContentLayout: customItemContentLayout,
        // Устанавливаем режим открытия балуна.
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размеры макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: 300,
        clusterBalloonContentLayoutHeight: 230,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5
        // Настройка внешего вида нижней панели.
        // Режим marker рекомендуется использовать с небольшим количеством элементов.
        // clusterBalloonPagerType: 'marker',
        // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
        // clusterBalloonCycling: false,
        // Можно отключить отображение меню навигации.
        // clusterBalloonPagerVisible: false
    });

    var placemarks = [];

    // Заполняем кластер геообъектами:

    // Слушаем клик на карте.
    var coords;

        // ----- Событие - Нажатие кнопки мыши на карте
    map.events.add('click', function (e) {
        coords = e.get('coords');
        console.log('Получаем координаты-', coords);
        // Определяем адресс по координатам
        getAddress(coords);

    });

    //clusterer.add(placemarks);
    //console.log('clusterer-endd=', clusterer.getGeoObjects());
    //map.geoObjects.add(clusterer);

    // Функция Определяет адрес по координатам (обратное геокодирование).
    function getAddress(coords, cluster = 0) {
    // var address1 = 1;

        ymaps.geocode(coords).then(function (res) {
            // выбираем только первый объект по найденным координатам
            var firstGeoObject = res.geoObjects.get(0);

            var address = firstGeoObject.getAddressLine();// получаем адрес этого объекта
            var reviewTexts; //
            var place;

            // console.log('address=', address);

            // Формируем шаблон для Баллуна

            var MyballoonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
                '<div class ="review" style="width: 380px; height: 530px;overflow: visible">' +
                    '<div class = "review__title" style="display: flex; align-items: center;' +
                        'width: 380px; height: 45px; background-color: #ff8663; border-top-left-radius: 15px;' +
                        'border-top-right-radius: 15px">' +
                        '<img class="title__img" src="image/marker1.png" style="width: 10px; height: 15px;' +
                         'margin-left: 10px">' +
                        '<div class = "title__address" style="display: flex; justify-content: space-between;' +
                         'align-items: center; width: 350px; padding-left: 10px; padding-right: 10px ">' +
                            '<p class = "title__tex">' + address + '</p>' +
                            '<img class = "title__cross" src="image/cross1.png">' +
                        '</div>' +
                    '</div>' +
                    '<div class = "review__text" style="width: 380px; height: 160px; overflow-y: auto">' +
                    '</div>' +
                    '<form id = "Review" name = "youReview" >' +
                        '<div class = "youReview_title" style="color: #ff8663; "> ВАШ ОТЗЫВ </div>' +
                        '<input name = "rname" type="text" placeholder="Ваше имя" style="width: 360px; height: 30px;' +
                         'margin-top: 15px; border-radius: 20px; padding-left: 15px; border: 1px solid #c4c4c4;' +
                         'font-size: 16px; ">' +
                        '<input name = "rlocal" type="text" placeholder="Укажите место" style="width: 360px;' +
                         'height: 30px; border-radius: 20px; padding-left: 15px; border: 1px solid #c4c4c4;' +
                         'font-size: 16px; margin-top: 15px">' +
                        '<textarea  name= "rtext" placeholder="Поделитесь впечатлениями" style="width: 360px;' +
                        'height: 130px; border-radius: 20px; padding-left: 15px; border: 1px solid #c4c4c4;' +
                        'font-size: 16px; margin-top: 15px">' + '</textarea>' +
                        '<input type="submit" value = "Добавить" style="width: 88px; background-color: #ff8663;' +
                         'height: 33px; border-radius: 20px; margin-left: 292px; font-size: 14px; margin-top: 15px;' +
                         'border: 1px solid #ff8663">' +
                    '</form>' +
                '</div>', {
                    build: function () {
                         // Сначала вызываем метод build родительского класса.
                        MyballoonContentLayoutClass.superclass.build.call(this);
                         // Получаем доступ к крестику и к форме.
                        let Review = document.querySelector('.review');
                        let reviewText = document.querySelector('.review__text');
                        let texts = reviewText.innerHTML;
                        let ArrayObj =[];
                        let Obj ={};
                        let address = firstGeoObject.getAddressLine();

                        // проверяем наличие в sessionStorage хранилища c именем - Review

                        if (storage.Review) { // при наличии хранилища читаем из него данные
                            ArrayObj = JSON.parse(storage.Review);
                            // console.log('ArrayObj-000 =', ArrayObj);
                            // если массив объектов не пустой - перебираем его элементы
                            if (ArrayObj.length) {
                                for (let i = 0; i < ArrayObj.length; i++) {
                                    if (ArrayObj[i].address == address) {
                                        // записываем данные в div - class=review__text
                                        texts = texts + '<b>' + ArrayObj[i].name + '</b>' + ' ' +
                                            ArrayObj[i].local + '<br>' + ArrayObj[i].text + '<br>';
                                        reviewText.innerHTML = texts;
                                        reviewTexts = reviewText.innerText; // текст отзыва записывем в глоб.пер.
                                        // console.log('texts-000=', texts);
                                    }

                                }
                            }

                        }

                        // Собитие нажатие кнопки мыши внутри формы отзыва
                        Review.addEventListener('click', function (e) {

                            if (e.target.className == 'title__cross') { // если нажат крестик - закрытия формы
                                map.balloon.close(); // закрываем баллун
                            }
                            if (e.target.type == 'submit') { // если нажата кнопка - submit
                                let rname, rlocal, rtext, address;

                                let elForm =e.target.parentElement;

                                for (let i = 0; i < elForm.children.length; i++ ) {
                                    if (elForm.children[i].name == 'rname') { // получаем имя написавшего отзыв
                                        rname = elForm.children[i].value;
                                    }
                                    if (elForm.children[i].name == 'rlocal') { // получаем место отзыва
                                        rlocal = elForm.children[i].value;
                                    }
                                    if (elForm.children[i].name == 'rtext') { // получаем текст отзыва
                                        rtext = elForm.children[i].value;
                                    }
                                }
                                // получаем  адресс метки
                                address = firstGeoObject.getAddressLine();
                                // формируем объект отзыва
                                Obj = { address: address, name: rname, local: rlocal, text: rtext };
                                // добавляем объект в массив объектов
                                ArrayObj.push(Obj);
                                // записываем массив объектов в хранилище
                                storage.Review = JSON.stringify(ArrayObj);

                                // Получаем поле, куда будем записывать отзыв
                                reviewText = e.target.parentElement.parentElement.childNodes[1];
                                // формируем запись отзыва
                                texts = texts + '<b>' + rname + '</b>' + ' ' + rlocal + '<br>' + rtext + '<br>';
                                reviewText.innerHTML = texts;
                                reviewTexts = reviewText.innerText; // текст отзыва записывем в глоб.пер.

                                //
                                ArrayObj = JSON.parse(storage.Review);
                                let counterMark =0;

                                for (let i = 0; i < ArrayObj.length; i++) {
                                    // console.log('address-!!=', address);
                                    // counterMark = counterMark +1;
                                    if (ArrayObj[i].address == address && counterMark == 0 && cluster == 0) {
                                        counterMark = counterMark +1;
                                        console.log('ArrayObj[i]-0=', ArrayObj[i], 'i=', i);
                                        console.log('counterMark-0=', counterMark);
                                        console.log('address-0=', address);
                                        console.log('coords-!!=', coords);

                                        reviewTexts = ArrayObj[i].text;
                                        let place = ArrayObj[i].local;
                                        placemark.properties.set({
                                            balloonContentHeader: place,
                                            balloonContentFooter: reviewTexts
                                        });
                                        placemarks.push(placemark); // добаляем метку в массив  меток
                                        // console.log('placemarks-00=', placemarks);
                                        clusterer.add(placemarks); // записываем  метку в кластер
                                        console.log('clusterer=', clusterer.getGeoObjects());
                                        map.geoObjects.add(clusterer); // добапвляем кластер на карту
                                    }
                                }

                                e.preventDefault(); // отменяем стандартные действия кнопки -submit

                            } // end if - нажати кнопки - submit
                            // console.log('E=', e)

                        })
                            // console.log('placemarks-build', placemarks)
                    } // end build function
                });
            // открываем баллун
            map.balloon.open([coords[0], coords[1]], address, {
                // Опция: не показываем кнопку закрытия.
                // balloonContentHeader: 'Мой баллун',
                contentLayout: MyballoonContentLayoutClass,
                closeButton: false,
                maxHeight: 530,
                maxWidth: 380
            });
            // Определяем свойства метки
            var placemark = new ymaps.Placemark([coords[0], coords[1]], {

                // Устаналиваем данные, которые будут отображаться в балуне.
                balloonContentHeader: place,
                balloonContentBody: '<a href = "#">' +address + '</a>',
                balloonContentFooter: reviewTexts
            },
                {
                    balloonContentLayout: MyballoonContentLayoutClass,
                    balloonMaxHeight: 530,
                    balloonMaxWidth: 380,
                    balloonPanelMaxMapArea: 0,
                    balloonCloseButton: false
                }
        ); // end geocode(coords)

        clusterer.balloon.events.add('click', function (e) {
            // console.log('E-clasterer=', e);

            let clastererLink = document.querySelector('.ballon_body');

            clastererLink = clastererLink.innerText;
            // console.log('clastererLink-1=', clastererLink);
            // console.log('E-clasterer=', e.originalEvent.target);

            ymaps.geocode(clastererLink).then(function (res) {
                // выбираем только первый объект по найденным координатам
                let coordsAddress = res.geoObjects.get(0).geometry.getCoordinates();
                //console.log('coordsAddress-1=', coordsAddress);
                getAddress(coordsAddress, cluster = 1);

            })

        })

    })
    }

    clusterer.balloon.open(clusterer.getClusters()[0]);
});
