
import 'materialize-css/dist/css/materialize.css';
import 'materialize-css/dist/js/materialize.js';
import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';


import view from './hsDom';
import './ul.scss';

const axios = require('axios').default;
const querystring = require('querystring');


(function(){


    const initModel = {
        destination:null,
        destinationParams:null,
        sizeLimit:1,
        fileLimit:5,
        selectOpts:null,
        showDescription:false,
        files: [],
        alertMessages: [],
        isSubmitting: false,
        submitProgress: 0,
    };

    function updateModel(msg, model, e, dispatch) {
        model.alertMessages = [];
        switch (msg) {
            case 'manualSelect': return queueFiles(e.srcElement.files, model);
            case 'remove': return removeFile(model, e);
            case 'dropfile': return queueFiles(e.dataTransfer.files, model);
            case 'updateDesc': return updateDesc(model, e);
            case 'updateType': return updateType(model, e);

            case 'submit': return submitFiles(model, dispatch);
            case 'submitSuccess': return submitSuccess(model);
            case 'submitError': return submitError(model, e);
            case 'uploadProgress': return model;
            default: return model;
        }
    }

    function submitError(model, e){
        model.alertMessages.push('File upload failed');
        model.alertMessages.push(e);
        model.isSubmitting = false;
        model.submitProgress = 0;
        return model;
    }

    function submitSuccess(model){
        model.alertMessages.push(`File${model.files.length > 1 ? 's' : ''} successfully uploaded`);
        model.files = [];
        model.isSubmitting = false;
        model.submitProgress = 0;
        return model;
    }

    function submitFiles(model, dispatch) {
        model.isSubmitting = true;
        let fd = new FormData();
        model.files.forEach(f => {
            fd.append("file", f);
        });
        axios({
            method: 'post',
            url: model.destination,
            params: model.destinationParams,
            paramsSerializer: (params) => querystring.stringify(params),
            headers: {'Content-Type': 'multipart/form-data'},
            data: fd,
            onUploadProgress: (e) => {
                // console.log('prog',e);
                let pos = e.loaded || e.position;
                if (e.lengthComputable){
                    model.submitProgress = Math.ceil(pos / e.total * 100 );
                    dispatch('uploadProgress');
                }
            }
        })
        .then(r => {
            dispatch('submitSuccess');
        })
        .catch(e => {
            dispatch('submitError', e)
        });
        return model;
    }

    function updateType(model, e){
        // console.log('selCh', e);
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
            model.alertMessages.push(`The limit for the number of file uploads is ${model.fileLimit}`);
            return model;
        }
        for (let i =0; i < fl.length; i++) {
            // console.log('sizeFl', fl[i]);
            if (fl[i].size > (model.sizeLimit * 1048576)) {
                model.alertMessages.push(`The size limit for individual files is ${model.sizeLimit} MB.`);
                model.alertMessages.push(`${fl[i].name} is ${(fl[i].size/1048576).toFixed(1)} MB`);
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
        let rootNode = createElement(currentView);
        node.appendChild(rootNode);
        // node.appendChild(currentView);

        // ...and updated view (dispatch nested here to isolate side effects) ...
        function dispatch(msg, e) {
            model = updateModel(msg, model, e, dispatch);
            // console.log('dispatch model', model);
            // console.log('dispatch e', e);
            const updatedView = view(dispatch, model);
            const patches = diff(currentView, updatedView);
            rootNode = patch(rootNode, patches);
            // node.replaceChild(updatedView, currentView);
            currentView = updatedView;
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const rootNode = document.querySelector('#uploader');
        app(initModel, updateModel, view, rootNode);
    });

}());
