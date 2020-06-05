
import 'materialize-css/dist/css/materialize.css';
import 'materialize-css/dist/js/materialize.js';
import view from './hsDom';
import './ul.scss';

(function(){


    const initFileList = [];

    function updateModel(msg, model, e) {
        switch (msg) {
            case 'manualSelect': return queueFiles(e.srcElement.files, model);
            case 'remove': return model.filter(f => f.name !== e.srcElement.attributes['name'].value);
            case 'submit': return submitFiles(model);
            case 'dropfile': return queueFiles(e.dataTransfer.files, model);
            // case 'dropfile': return model;
            default: return model;
        }
    }

    function queueFiles(fl, model) {
        // if (manifest.length == opts.fileLimit || opts.fileLimit < manifest.length + fl.length) {
        //     const limitMsg = `The limit for number of file uploads is ${opts.fileLimit}.`;
        //     const $modal = $('.modal');
        //     $modal.find('.modal-body').html(limitMsg);
        //     $modal.modal('show');
        //     return;
        // }
        // let $src = $(".queueSrc").html();
        for (let i =0; i < fl.length; i++) {
            // if (fl[i].size > (opts.sizeLimit * 1048576) || false ) {
            if (false ) {
                // const sizeMsg = `
                //     The size limit for individual files is ${opts.sizeLimit} MB.
                //     <br><b>${fl[i].name}</b> is ${(fl[i].size/1048576).toFixed(1)} MB.`
                // const $modal = $('.modal');
                // $modal.find('.modal-body').html(sizeMsg);
                // $modal.modal('show');
                return;
            }else{
                // $("<div class='row fileQueue'></div>")
                //     .html($src)
                //     .find('.col.name b').text(fl[i].name).end()
                //     .find('.remove input').attr('data-name', fl[i].name).end()
                //     .insertAfter(".row.ddHandler")
                //     .animate({opacity:1},850);
                model.push(fl[i]);
            }
        }
        // $('.row.submit').css('display','flex');
        // console.log('model', model);
        return model;
    }

    // impure function block...
    // todo; why does updatemodel need to be passed in as an arg? Cant be just called from dispatch?
    function app(initFileList, updateModel, view, node) {
        let model = [];

        // send dispatch as arg so can be specified in events created in view fn..
        // for initial view..
        let currentView = view(dispatch, model);
        node.appendChild(currentView);

        // ...and updated view (dispatch nested here to isolate side effects) ...
        function dispatch(msg, e) {
            model = updateModel(msg, model, e);
            // console.log('dispatch model', model);
            console.log('dispatch e', e);
            const updatedView = view(dispatch, model);
            node.replaceChild(updatedView, currentView);
            currentView = updatedView;
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const rootNode = document.querySelector('#uploader');
        app(initFileList, updateModel, view, rootNode);
    });

}());
