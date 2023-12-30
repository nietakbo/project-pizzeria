import { templates,select } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

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
        thisBooking.dom.datePicker = thisBooking.element.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.element.querySelector(select.widgets.hourPicker.wrapper);
    }
    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){

        });
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){

        });
        thisBooking.dom.datePicker.addEventListener('updated', function(){

        });
        thisBooking.dom.hourPicker.addEventListener('updated', function(){

        });
    }
}
export default Booking;