import { templates,select, settings, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking{
    constructor(element){
        const thisBooking = this;

        thisBooking.selectedTable = null;

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey +'='+ utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey +'='+ utils.dateToStr(thisBooking.datePicker.maxDate);

        const params={
            bookings:[
                startDateParam,
                endDateParam,
            ],
            eventsCurrent:[
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat:[
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        // console.log('getData params', params);

        const urls={
            bookings:       settings.db.url + '/' + settings.db.bookings 
                                           + '?' + params.bookings.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events 
                                           + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.events 
                                           + '?' + params.eventsRepeat.join('&'),
        };

        // console.log('urls', urls);
        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function(allResponses){
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ])
            })
            .then(function([bookings,eventsCurrent,eventsRepeat]){
                // console.log(bookings);
                // console.log(eventsCurrent);
                // console.log(eventsRepeat);
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            })
    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked={};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        // console.log(thisBooking.booked);
        thisBooking.updateDOM();
    }

    makeBooked(date,hour,duration,table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date]=='undefined'){
            thisBooking.booked[date]={};
        }

        const startHour = utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour+duration; hourBlock += 0.5){
            // console.log('loop', hourBlock);
            if(typeof thisBooking.booked[date][hourBlock]=='undefined'){
                thisBooking.booked[date][hourBlock]=[];
            }
    
            thisBooking.booked[date][hourBlock].push(table);

        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(typeof thisBooking.booked[thisBooking.date] == "undefined" || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == "undefined"){
            allAvailable = true;
        }

        for(let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }
            if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    render(element){
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();
        thisBooking.element = utils.createDOMFromHTML(generatedHTML);
        
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.appendChild(thisBooking.element);
        thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
        thisBooking.dom.allTables = element.querySelector(select.booking.allTables);
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.bookTable = thisBooking.dom.wrapper.querySelector(select.booking.bookTable);
        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    }

    initTables(event){
        const thisBooking = this;

        const clickedElement = event.target;
        const selectTable = classNames.booking.selectTable;
        if(!clickedElement.classList.contains('table')){
            return;
        }
        if(clickedElement.classList.contains(classNames.booking.tableBooked)){
            alert('This table is already book! Choose another')
        }
        const clickedTable = clickedElement;
        let tableId = clickedTable.getAttribute(settings.booking.tableIdAttribute);

        if(thisBooking.selectedTable && thisBooking.selectedTable !== tableId){
            const selectedTable = thisBooking.dom.allTables.querySelector('.selected');
            selectedTable.classList.remove(selectTable);
        }

        if(!clickedTable.classList.contains(selectTable)){
            thisBooking.selectedTable = tableId;
            clickedTable.classList.add(selectTable);
        }
        else{
            thisBooking.selectedTable = null;
            clickedTable.classList.remove(selectTable);
        }
    }

    resetTables(){
        const thisBooking = this;
        for(let table of thisBooking.dom.tables){
            table.classList.remove(classNames.booking.selectTable);
        }
        thisBooking.selectedTable=null;
    }

    SelectedStarters(){
        const thisBooking = this;
        thisBooking.selectedStarters = [];

        for(let starter of thisBooking.dom.starters){
            if(starter.checked){
                thisBooking.selectedStarters.push(starter.value);
            }
        }
    }

    sendBooking(){
        const thisBooking = this;

        const selectedStarters = thisBooking.SelectedStarters();
        const url = settings.db.url + '/' + settings.db.bookings;
        
        const payload = {
            date: thisBooking.datePicker.value,
            hour: thisBooking.hourPicker.value,
            table: thisBooking.selectedTable,
            duration: parseInt(thisBooking.hoursWidget.value),
            ppl: parseInt(thisBooking.peopleWidget.value),
            starters: selectedStarters,
            phone: thisBooking.dom.phone.value,
            address: thisBooking.dom.address.value,
        }

        const options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              };
              
              fetch(url, options)
                .then(response => response.json())
                .then(() => {
                    thisBooking.makeBooked(
                    payload.date,
                    payload.hour,
                    payload.duration,
                    payload.table
                    );
                    console.log('rezerwacja udana', payload);
                })
              
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

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
            thisBooking.resetTables();
        });

        thisBooking.dom.allTables.addEventListener('click', function(event){
            thisBooking.initTables(event);
        });

        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            thisBooking.sendBooking();
        })

    }
}
export default Booking;