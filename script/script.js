document.addEventListener('DOMContentLoaded', function() {

    const search = document.querySelector('.search');
    const cartBtn = document.getElementById('cart');
    const wishlistBtn = document.getElementById('wishlist');
    const goodsWrapper = document.querySelector('.goods-wrapper');
    const cart = document.querySelector('.cart');
    const category = document.querySelector('.category'); // переменная для фильтра по категориям

    
    const createCardGoods = (id, title, price, img) => {
        const card = document.createElement('div');        
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `  <div class="card">
                                <div class="card-img-wrapper">
                                    <img class="card-img-top" src="${img}" alt="">
                                    <button class="card-add-wishlist"
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

    // Открытие корзины

    const openCart = event => {
        event.preventDefault();
        cart.style.display = 'flex'; // вешаем свойство display: flex; корзине
        document.addEventListener('keyup', closeCart);  // отслеживаем событие для закрытия
    };

    const renderCard = items => { // функция принимает товар и обрабатывает    
        goodsWrapper.textContent = '';   
        items.forEach(({ id, title, price, imgMin }) => { // передаем объект в {} в помощью диструктивного присвоения

            goodsWrapper.append(createCardGoods(id, title, price, imgMin));
            
        }); 
            
    };

    const getGoods = (handler, filter) => { // функция получает товар,
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


    cartBtn.addEventListener('click', openCart);
    cart.addEventListener('click', closeCart);
    category.addEventListener('click', chooseCategory);
    

    getGoods(renderCard, randomSort);

    window.onload = function() {
        this.document.getElementById('hide-spiner').style.display='none'
        this.document.querySelector('.goods-wrapper').style.opacity='1' 
    };

});