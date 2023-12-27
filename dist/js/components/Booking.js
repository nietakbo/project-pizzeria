import { templates,select } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Booking{
    constructor(element){
        const thisBooking = this;
        thisBooking.render(element);
        thisBooking.initWidgets();
    }
    render(element){
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();
        thisBooking.element = utils.createDOMFromHTML(generatedHTML);
        
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.appendChild(thisBooking.element);
        thisBooking.dom.peopleAmount = thisBooking.element.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.element.querySelector(select.booking.hoursAmount);
    }
    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){

        });
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){

        });
    }
}
export default Booking;