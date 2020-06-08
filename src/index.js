
import 'materialize-css/dist/css/materialize.css';
import 'materialize-css/dist/js/materialize.js';

import view from './hsDom';
import './ul.scss';

(function(){


    const initModel = {
        destination:null,
        destinationParams:null,
        sizeLimit:1,
        fileLimit:5,
        selectOpts:null,
        showDescription:false,
        // postFn:$.noop,
        files: [],
        sizeAlert: {
            show: false,
            name: null,
            size: null
        },
        numberAlert: false
    };

    function updateModel(msg, model, e) {
        model.numberAlert = model.sizeAlert.show = false;
        switch (msg) {
            case 'manualSelect': return queueFiles(e.srcElement.files, model);
            case 'remove': return removeFile(model, e);
            case 'submit': return submitFiles(model);
            case 'dropfile': return queueFiles(e.dataTransfer.files, model);
            case 'updateDesc': return updateDesc(model, e);
            case 'updateType': return updateType(model, e);
            default: return model;
        }
    }

    function updateType(model, e){
        console.log('selCh', e);
        const name = e.target.attributes['name'].value;
        const val = e.target.value;
        model.files.map(f => {
            if (f.name === name) f.fileType = val;
            return f;
        });
        return model;
    }

    function updateDesc(model, e) {
        const name = e.target.attributes['name'].value;
        const val = e.target.value;
        model.files.map(f => {
            if (f.name === name) f.description = val;
            return f;
        });
        return model;
    }

    function removeFile(model, e) {
        model.files = model.files.filter(f => f.name !== e.srcElement.attributes['name'].value);
        return model;
    }

    function queueFiles(fl, model) {
        if (model.files.length == model.fileLimit || model.fileLimit < model.files.length + fl.length) {
            model.numberAlert = true;
            return model;
        }
        for (let i =0; i < fl.length; i++) {
            console.log('sizeFl', fl[i]);
            if (fl[i].size > (model.sizeLimit * 1048576)) {
                model.sizeAlert.show = true;
                model.sizeAlert.name = fl[i].name;
                model.sizeAlert.size = fl[i].size;
                return model;
            }else{
                model.files.push(fl[i]);
            }
        }
        // console.log('model', model);
        return model;
    }

    // impure function block...
    // todo; why does updatemodel need to be passed in as an arg? Cant be just called from dispatch?
    function app(initModel, updateModel, view, node) {
        const config = JSON.parse(node.querySelector('#config').innerHTML);
        let model = {...initModel, ...config};
        if (model.showDescription) File.prototype.description = '';
        if (model.selectOpts) File.prototype.fileType = '';

        // send dispatch as arg so can be specified in events created in view fn..
        // for initial view..
        let currentView = view(dispatch, model);
        node.appendChild(currentView);

        // ...and updated view (dispatch nested here to isolate side effects) ...
        function dispatch(msg, e) {
            model = updateModel(msg, model, e);
            console.log('dispatch model', model);
            // console.log('dispatch e', e);
            const updatedView = view(dispatch, model);
            node.replaceChild(updatedView, currentView);
            currentView = updatedView;
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const rootNode = document.querySelector('#uploader');
        app(initModel, updateModel, view, rootNode);
    });

}());
