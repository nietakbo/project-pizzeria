import { select,templates,settings} from "./settings.js";
import utils from './utils.js';
import CartProduct from "/CartProduct.js";

class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products=[];

      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart:',thisCart);
    }
    getElements(element){
      const thisCart = this;

      thisCart.dom={};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger=thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList=thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee=element.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice=element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice=element.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber=element.querySelector(select.cart.totalNumber);
      thisCart.dom.form=element.querySelector(select.cart.form);
      thisCart.dom.phone=element.querySelector(select.cart.phone);
      thisCart.dom.address=element.querySelector(select.cart.address);

    }
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle('active');
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      })
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      })
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      })
    }
    add(menuProduct){
      console.log('adding product:', menuProduct);
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const element = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(element);
      thisCart.products.push(new CartProduct(menuProduct, element));
      thisCart.update();
    }
    update(){
      const thisCart = this;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      for(const product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }
      if(thisCart.totalNumber==0){
        thisCart.deliveryFee = 0;
      }
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

      thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;
      for(const element of thisCart.dom.totalPrice){
        element.innerHTML = thisCart.totalPrice;
      }
    }
    remove(cartProduct){
      const thisCart = this;
      cartProduct.dom.wrapper.remove();
      const indexOfProduct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfProduct,1);
      thisCart.update();
    }
    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      }
      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
    }
  }
  export default Cart;