import { select, settings, classNames, templates } from "./settings.js";
import Product from "./components/product.js";
import Cart from "./components/Cart.js";

  const app = {
    initMenu: function(){
      const thisApp=this;

      console.log('thisApp.data', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }

      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);

    },

    initData: function(){
      const thisApp=this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          thisApp.data.products = parsedResponse;
          thisApp.initMenu();
        })
        console.log('thisApp.data', JSON.stringify(thisApp.data));
      },
    
    initCart: function(){
      const thisApp=this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
