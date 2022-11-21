// ==UserScript==
// @name         Stockx-price fix
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Check fixed prices with single click
// @author       LenyBombka
// @match        https://stockx.com/*
// @icon         https://www.thedropdate.com/wp-content/uploads/2019/10/London-Drop-Off-blog-thumbnail.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Delete '//' in line that match your stockx lvl fee...
    const fee=0.1//default-- add "//" in front if different chosen
    //const fee=0.085
    //const fee=0.09
    //const fee=0.095


    function getRow(){//2 different types of css on stockx
    if ((document.getElementsByClassName("chakra-text css-rcp4jd")[0])){
        let row=(document.getElementsByClassName("chakra-text css-rcp4jd")[0]);
        return row
      }else{
        //console.log('else');
        let row=(document.getElementsByClassName("chakra-stack css-84zodg")[0]);
        return row
      }
    }

    function stockxRound(n){
     let b=n%1
     if (b>0.79){//if it is above .8 return higher number, if not return rounded down
         return Math.round(n)
      }
     else{
      return Math.round(n-b)
     }
    }

    function getWantedPrice(){//get's wanted price of single item
        var rowValue=getRow().textContent;
        var leftFullWordIndex=rowValue.indexOf("Lowest Ask:");//find index of lowest ask, to cut just it
        rowValue=rowValue.slice(leftFullWordIndex,);
        var leftIndex=rowValue.indexOf('£');
        rowValue=rowValue.slice(leftIndex+1,);//get just int, no matter is it 1-4 digit long'
        rowValue=rowValue.split('W')[0]//delete everything after
        var wantedPrice=stockxRound(rowValue/1.05)-1
        return Math.trunc(wantedPrice);
    }
    function getPayout(wantedPrice){
        //let wantedPrice=getWantedPrice();//I ll just past it, there is no need to calculate it 2 times
        wantedPrice=Math.round(wantedPrice)//round it, because user input have to be intiger
        console.log((wantedPrice*fee).toFixed(2))
        var possiblePayout=(wantedPrice-(wantedPrice*fee).toFixed(2)-(wantedPrice*0.03).toFixed(2)-4.36).toFixed(2)
        return possiblePayout
    }
        function getDataTable(){
        var table= document.getElementsByClassName("chakra-table css-eu8z4w")[0];
        return table
    }
    function checkSingleItemFunc(){
        var wantedPriceHTML = document.createElement("span");
        let wantedPrice=getWantedPrice();
        let payout=getPayout(wantedPrice);
        if(document.getElementById("wantedPriceID")){//already inserted to DOM
            document.getElementById("wantedPriceID").innerHTML='Wanted Price:'+wantedPrice+"£";
            document.getElementById("PayoudID").innerHTML='Your payout:'+payout+"£";
            return
        }
        var row=getRow();//not in the DOM
        wantedPriceHTML.innerHTML='Wanted Price:'+wantedPrice+"£";
        wantedPriceHTML.className="css-d5w67v";
        wantedPriceHTML.id="wantedPriceID";
        row.append(wantedPriceHTML);
        var payoutHTML = document.createElement("span");
        payoutHTML.id="PayoudID";
        payoutHTML.innerHTML='Your payout:'+payout+"£";
        payoutHTML.className="css-d5w67v";
        row.append(payoutHTML);
    }
    function checkAllItemsFunc(){
        console.log('check all func');
        var table= getDataTable();
        var skip=0;
        for (var i = 0, row; row = table.rows[i]; i++) {
            if (skip<1){//skips the row with "Ask Price and Lowest Ask"
                skip+=1;
                continue
            }
            var askPrice=row.cells[1].lastElementChild.textContent.slice(1,);//delete gbp from string
            var lowestAsk=row.cells[3].lastElementChild.textContent.slice(1,);
            lowestAsk.replace(",","");//delete "," if they appear
            askPrice.replace(",","");
            lowestAsk=parseInt(lowestAsk);//parse to int to make calculations possible
            askPrice=parseInt(askPrice);
            //console.log(lowestAsk,askPrice);
            if(lowestAsk/1.05<askPrice-0.3){
                console.log(lowestAsk/1.05,askPrice)
                row.cells[1].lastElementChild.style.backgroundColor="#DAD6D5";
                row.cells[1].lastElementChild.style.border="inset";
                row.cells[1].lastElementChild.style.borderRadius="10px";
                row.cells[1].lastElementChild.style.display="inline-block";

            }
        }
    }
    function generateNavbar(){
        const shipBy = document.querySelector('[data-component="InlineNotification"]');//seletcing existing navbar and removing it
        shipBy.remove();
        var topNavbar=document.createElement("div");
        topNavbar.dataset.component="InlineNotification"
        topNavbar.classList.add('css-0');//adding stockx styles
        topNavbar.style="background-color:#393939; height:45px;";
        var page=document.getElementById("site-header");
        page.prepend(topNavbar);
        var span = document.createElement("span");//creating my own element to insert into the dom
        topNavbar.innerHTML=`<button type='button'
        id="checkAllItemsButton"
        style='width: 50%;color:white;height:100%;font-weight: bold;'
        >CHECK ALL ITEMS
        </button><button type='button'
        id="checkSingleItemButton"
        style='width: 50%;height:100%;color:white;top:50%;font-weight: bold;'
        >CHECK ITEM</button>"`;
        var checkAllItems=document.getElementById("checkAllItemsButton");
        var checkSingleItem=document.getElementById("checkSingleItemButton");
        checkAllItems.addEventListener("click",checkAllItemsFunc)
        checkSingleItem.addEventListener("click",checkSingleItemFunc)
    }
    setTimeout(generateNavbar,3000);
})();