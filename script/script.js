document.addEventListener('DOMContentLoaded', function() {

    const search = document.querySelector('.search');
    const cartBtn = document.getElementById('cart');
    const wishlistBtn = document.getElementById('wishlist');
    const goodsWrapper = document.querySelector('.goods-wrapper');
    const cart = document.querySelector('.cart');
    const category = document.querySelector('.category'); // переменная для фильтра по категориям
    const cardCounter = cartBtn.querySelector('.counter');
    const wishlistCounter = wishlistBtn.querySelector('.counter');
    const cartWrapper = document.querySelector('.cart-wrapper');

    const wishlist = [];

    let goodsBasket = {};

    const loading = (nameFunction) => {
        const spinner = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
        </div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>`;

        if (nameFunction === 'renderCard') {
            goodsWrapper.innerHTML = spinner;
        }

        if (nameFunction === 'renderBasket') {
            cardWrapper.innerHTML = spinner;
        }
    };

    
    const createCardGoods = (id, title, price, img) => {
        const card = document.createElement('div');        
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `  <div class="card">
                                <div class="card-img-wrapper">
                                    <img class="card-img-top" src="${img}" alt="">
                                    <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : '' }"
                                        data-goods-id="${id}"></button>
                                </div>
                                <div class="card-body justify-content-between">
                                    <a href="#" class="card-title">${title}</a>
                                    <div class="card-price">${price} ₽</div>
                                    <div>
                                        <button class="card-add-cart"
                                            data-goods-id="${id}">
                                            Добавить в корзину
                                        </button>
                                    </div>
                                </div>
                            </div>`;
        return card;
    };   

    const renderCard = items => { // функция принимает товар и обрабатывает    
        goodsWrapper.textContent = '';   

        if (items.length) {
            items.forEach(({ id, title, price, imgMin }) => { // передаем объект в {} в помощью диструктивного присвоения

            goodsWrapper.append(createCardGoods(id, title, price, imgMin));            
        }); 
        } else {
            goodsWrapper.textContent = '❌ Извините, мы не нашли товаров по вашему запросу';
        }            
    };


    // создаем товары в корзине

    const createCardGoodsBasket = (id, title, price, img) => {
        const card = document.createElement('div');        
        card.className = 'goods';
        card.innerHTML = ` <div class="goods-img-wrapper">
                                <img class="goods-img" src="${img}" alt="">

                            </div>
                            <div class="goods-description">
                                <h2 class="goods-title">${title}</h2>
                                <p class="goods-price">${price} ₽</p>

                            </div>
                            <div class="goods-price-count">
                                <div class="goods-trigger">
                                    <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : '' }" 
                                        data-goods-id="${id}"></button>
                                    <button class="goods-delete" data-goods-id="${id}"></button>
                                </div>
                                <div class="goods-count">${goodsBasket[id]}</div>
                            </div>`;
        return card;
    };   

    const renderBasket = items => { // функция принимает товар и обрабатывает    
        cartWrapper.textContent = '';

        if (items.length) {
            items.forEach(({ id, title, price, imgMin }) => { // передаем объект в {} в помощью диструктивного присвоения

            cartWrapper.append(createCardGoodsBasket(id, title, price, imgMin));
        }); 
        } else {
            cartWrapper.innerHTML = '<div id="cart-empty">Ваша корзина пока пуста</div>';
        }            
    };

    // Закрытие корзины по клику на крестик или серое поле

    const closeCart = event => {
        const target = event.target;
        
        if (target === cart ||
            target.classList.contains('cart-close') ||
            event.keyCode === 27) {
                event.preventDefault(); // Отменяет стандартное поведение ссылки #
                cart.style.display = ''; // удаляем flex у модалки
                document.removeEventListener('keyup', closeCart);  //  удаляем отслеживание события 'keyup'
        };        
    };

    const showCardBasket = goods => goods.filter(item => goodsBasket.hasOwnProperty(item.id));

    // Открытие корзины

    const openCart = event => {
        event.preventDefault();
        cart.style.display = 'flex'; // вешаем свойство display: flex; корзине
        document.addEventListener('keyup', closeCart);  // отслеживаем событие для закрытия
        getGoods(renderBasket, showCardBasket);
    };

    const getGoods = (handler, filter) => { // функция получает товар,
        loading(handler.name);
        fetch('db/db.json') // fetch API делает запрос на сервер и возвращает promis
            .then(response => response.json()) // берет данные методом json и данные переводит в массив и делает return
            .then(filter)
            .then(handler);   
                   
    };


    const randomSort = item => {
        return item.sort(() => Math.random() - 0.5);
    }


    const chooseCategory = event => {
        event.preventDefault();
        const target = event.target;

        if (target.classList.contains('category-item')) {  
            const category = target.dataset.category;          
            getGoods(renderCard, goods => goods.filter(item => item.category.includes(category)))
        }
    };

    const searchGoods = event => {
        event.preventDefault();

        const input = event.target.elements.searchGoods;
        const inputValue = input.value.trim(); // trim() метод убирает пробелы
        if (input.value !== '') {
            const searchString = new RegExp(inputValue, 'i')
            getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));
        } else {
            search.classList.add('error');
            setTimeout( () => {
                search.classList.remove('error')
            }, 2000);
        }
        
        input.value = '';
    };

    // взято из https://learn.javascript.ru/cookie#prilozhenie-funktsii-dlya-raboty-s-kuki

    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    const cookieQuery = get => {
        if (get) {
            if (getCookie('goodsBasket')) {
                goodsBasket = JSON.parse(getCookie('goodsBasket'));
            }            
            checkCount();
        } else {
            document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)};max-age=86400e3`;
        }
    };



    const checkCount = () => {
        wishlistCounter.textContent = wishlist.length;
        cardCounter.textContent = Object.keys(goodsBasket).length;
    };
    

    const storageQuery = get => {

        if (get) {
            if (localStorage.getItem('wishlist')) {
                const wishlistStorage = JSON.parse(localStorage.getItem('wishlist'));
                wishlistStorage.forEach(id => wishlist.push(id));
                checkCount();
            }
            
        } else {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    };

    const toggleWishlist = (id, elem) => {
        if (wishlist.includes(id)) {
            wishlist.splice(wishlist.indexOf(id), 1);
            elem.classList.remove('active');
        } else {
            wishlist.push(id);
            elem.classList.add('active');
        }
        console.log(wishlist);

        checkCount();
        storageQuery();
    };

    const addBasket = id => {
        if (goodsBasket[id]) {
            goodsBasket[id] += 1
        } else {
            goodsBasket[id] = 1
        }

        checkCount();
        cookieQuery();
    };


    const handlerGoods = event => {
        const target = event.target;

        if (target.classList.contains('card-add-wishlist')) {
            toggleWishlist(target.dataset.goodsId, target);
        };

        if (target.classList.contains('card-add-cart')) {
            addBasket(target.dataset.goodsId);
        }

    };


    const showWishlist = () => {
        getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)))
    };



    cartBtn.addEventListener('click', openCart);
    cart.addEventListener('click', closeCart);
    category.addEventListener('click', chooseCategory);
    search.addEventListener('submit', searchGoods);
    goodsWrapper.addEventListener('click', handlerGoods);
    wishlistBtn.addEventListener('click', showWishlist);

    getGoods(renderCard, randomSort);
    storageQuery(true);
    cookieQuery(true);
});