const ipcRenderer = require('electron').ipcRenderer;
const Odometer = require('odometer');
const style = document.createElement('style');

style.innerHTML = `
    *{
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
    }

    .odometer.odometer-auto-theme, .odometer.odometer-theme-default {
        display: inline-block;
        vertical-align: middle;
        *vertical-align: auto;
        *zoom: 1;
        *display: inline;
        position: relative;
      }
      .odometer.odometer-auto-theme .odometer-digit, .odometer.odometer-theme-default .odometer-digit {
        display: inline-block;
        vertical-align: middle;
        *vertical-align: auto;
        *zoom: 1;
        *display: inline;
        position: relative;
      }
      .odometer.odometer-auto-theme .odometer-digit .odometer-digit-spacer, .odometer.odometer-theme-default .odometer-digit .odometer-digit-spacer {
        display: inline-block;
        vertical-align: middle;
        *vertical-align: auto;
        *zoom: 1;
        *display: inline;
        visibility: hidden;
      }
      .odometer.odometer-auto-theme .odometer-digit .odometer-digit-inner, .odometer.odometer-theme-default .odometer-digit .odometer-digit-inner {
        text-align: left;
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
      }
      .odometer.odometer-auto-theme .odometer-digit .odometer-ribbon, .odometer.odometer-theme-default .odometer-digit .odometer-ribbon {
        display: block;
      }
      .odometer.odometer-auto-theme .odometer-digit .odometer-ribbon-inner, .odometer.odometer-theme-default .odometer-digit .odometer-ribbon-inner {
        display: block;
        -webkit-backface-visibility: hidden;
      }
      .odometer.odometer-auto-theme .odometer-digit .odometer-value, .odometer.odometer-theme-default .odometer-digit .odometer-value {
        display: block;
        -webkit-transform: translateZ(0);
      }
      .odometer.odometer-auto-theme .odometer-digit .odometer-value.odometer-last-value, .odometer.odometer-theme-default .odometer-digit .odometer-value.odometer-last-value {
        position: absolute;
      }
      .odometer.odometer-auto-theme.odometer-animating-up .odometer-ribbon-inner, .odometer.odometer-theme-default.odometer-animating-up .odometer-ribbon-inner {
        -webkit-transition: -webkit-transform 2s;
        -moz-transition: -moz-transform 2s;
        -ms-transition: -ms-transform 2s;
        -o-transition: -o-transform 2s;
        transition: transform 2s;
      }
      .odometer.odometer-auto-theme.odometer-animating-up.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-default.odometer-animating-up.odometer-animating .odometer-ribbon-inner {
        -webkit-transform: translateY(-100%);
        -moz-transform: translateY(-100%);
        -ms-transform: translateY(-100%);
        -o-transform: translateY(-100%);
        transform: translateY(-100%);
      }
      .odometer.odometer-auto-theme.odometer-animating-down .odometer-ribbon-inner, .odometer.odometer-theme-default.odometer-animating-down .odometer-ribbon-inner {
        -webkit-transform: translateY(-100%);
        -moz-transform: translateY(-100%);
        -ms-transform: translateY(-100%);
        -o-transform: translateY(-100%);
        transform: translateY(-100%);
      }
      .odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-default.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
        -webkit-transition: -webkit-transform 2s;
        -moz-transition: -moz-transform 2s;
        -ms-transition: -ms-transform 2s;
        -o-transition: -o-transform 2s;
        transition: transform 2s;
        -webkit-transform: translateY(0);
        -moz-transform: translateY(0);
        -ms-transform: translateY(0);
        -o-transform: translateY(0);
        transform: translateY(0);
      }
      
      .odometer.odometer-auto-theme, .odometer.odometer-theme-default {
        font-family: "Helvetica Neue", sans-serif;
        line-height: 1.1em;
      }
      .odometer.odometer-auto-theme .odometer-value, .odometer.odometer-theme-default .odometer-value {
        text-align: center;
      }
      

    table{
        width: 100%;
        text-align: center;
    }

    td{
        padding: 10px;
        font-size: 24px;
    }
    h5{
        font-size: 18px;
    }
`;
document.head.appendChild(style);
document.getElementById('app').innerHTML = `
<table>
<tr>
    <td>
        <h5 style="margin-bottom: 0; color: dodgerblue;">Cases</h5>
        <div id="cases"></div>
    </td>
</tr>
<tr>
    <td>
        <h5 style="margin-bottom: 0; color: red;">Deaths</h5>
        <div id="deaths"></div>
    </td>
</tr>
<tr>
    <td>
        <h5 style="margin-bottom: 0; color: green;">Recovered</h5>
        <div id="recovered"></div>
    </td>
</tr>
</table>
`;


const audio = new Audio("data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//uQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAgAAA14AAPDw8XFxcfHx8mJiYuLi42NjY+Pj5FRUVNTU1NVVVVXV1dZGRkbGxsdHR0fHx8g4ODi4uLi5OTk5ubm6KioqqqqrKysrq6usHBwcnJycnR0dHZ2dng4ODo6Ojw8PD4+Pj///8AAAAATGF2ZgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANeDekaYHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSxOsAGeYA/C4lLcruu6CmtMAAlA0ZBYRCTQi1jKwOyIlUUqSyx6HNhSR480QBq1K0GsWpgw1AjsRmc7MAoGHBUL2WR9Y6SCBYFFCEA7AiA3rFXtSrF2XspSvlaBJexjhC5C4SNyDqjTbQ5A+GdHel9urLwECMQGLoGGEDosmDpdsrbggJIhJapS1ZbEVRFmTAB7e7edzB7J5+Ic6LD092bDAowQ02Zsx6sRmi2JkhYs3XkxZNGCGnmESslhBdahBA/Cf5Tz97P+/zP7GjHBGTlvwIAHQgwFEh6z3kYnE2sOmvtRoWC4yKaYUrp2XRh12YZh2llMO4fz8///////////////9qDHHXdyVWdVMMMM6Sms2/5n//////NU1NvKtKg1NVEpFRoEAAAAigr/fj4WZZnG+hRjZoYuOGPiRzgwbpDnTuyEBsKMaMRBDaAnMxhKMcWSYdEgsi2EKAOYAVp9Nk0AqWSlmUk+MZVgSuaewctOOhg5A01Z1T0rftOFP2Xu4QijSiE9dwGJk7xKbQZbaYp0UAF4G1aeoWprGHAv/7ksTsACuGFx25rQAE37rjszeQAB5waJ22BtpAk+/Lowms6aRKA184ZS9f54YvFoX2aj0ojDssYksZf5fjSWrJusOd1O9/Yo5UmqQXDkegmUz1Ayho6mkYetAC0yA5qBpNIKsNPwx9qlMuR9426TYpLD7EmjrDus/C2KOTuDTxSJMthxu0RlTi3JDEnSZxFHokzX6uc1GsqeMTMri8bcaXQNa5O40dIrbSOLVza5ALswU7sOTFu1P7yx5/91/e////////////2dx3/lCQWIvqxAAAEYLGAwQQgAwIideQ6GIymLjRhEeQgCqRk4eZSbmk1hnJeYCVNJMHASwAg43DBaNmca1EUgJNyn7iSdL7Ewx4TTUiU3i76YKV6AJl8EP/KU8RoCvExIgk4jU8TZ24P5I4blENiRi5CSay715+aHCxAj/udLGcSweWeXhcKlYlBqNeV0Xa9SNU1BTxuISzB+XbR7RbVUWI0WkjGrVa3qk/4w/iPjsuvy7XLIFkGBmwKWhaA0IJgoL/21euU1u7qpjH697cMVrEdh+BIYgGbTz/+5LEaIAnEiclmbwADBO0qKczgADY0xAuGLHonvTPEAolao8dX7FftbDl/teTQ3DfcbV63SXq//+cru3JYkCpe1gDAf2WQBH2DtPpv/ff///////////////9bzzzw5/////////////+77ryyXvdKKeX1rEslD8PpIEiOGCBCBAABAACAOEBRa0hRF2kKggUuKQmtWUxVKccIKbSWLrusv8lKEHRndWG4dVjEvgJCzFjqZLSe1NYuui6t93GpMJUtTVkD1tqh1ji52ToZqvRnWqtREmq19wXE1NoBFGU90c2QpXpy4LCqIS5/bL+V3VlcNTDWE30z36fKNrFZ43Rk01DstkE5KI1OfWhl0pM4sD25TGZ7UdgKXUkts231t3YzM0kqy71j8OYUzoLofRw2sPfbmdVJmE00j+MzM7969q3K6v7z3Dl2okOwlZDxuTWi9SGY040Zhmmt0tPDtqmzvYX8rvOWd/n+Osc9fnv5iVVblauw0LI/gyKvaMeof+xagBBw2xuIFLiPoHCBdpaGAJe1ZJfQLkQDGUSKSvoFE1H//uSxBAAmBF1MD2HgAMNsiRZp6W54XFzENXspIT46SYgIpmJtEOlET4ekMFDWpSpwkx/lKxKtgOpDk8Ow4kuWJqLElIcd6yl+mfF2NdIltORCsOL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");
odometerOptions = { auto: false };
const render = elem=>{
    const meter = new Odometer({
        el: document.getElementById(elem),
        value: 0,
        theme: 'default'
    });
    meter.render();
    return meter;
}
const meters = {
    cases: render('cases'),
    deaths: render('deaths'),
    recovered: render('recovered')
}
let oldValues = {};
ipcRenderer.on('store-data', function (event,store) {
    let changed = false;
    for(var key in store){
        const o = oldValues[key] || 0;
        const n = store[key] || 0;
        changed = changed || n !== o;
        if(meters[key]){
            meters[key].update(store[key] || 0);
        }
    }
    if(changed){
        audio.play();
    } 
    oldValues = store || {};
});